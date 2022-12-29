import {
    CreateCollectionRequest,
    CollectionId,
    CollectionVersion,
    CollectionVersionState,
    UpdateCollectionRequest, Collection, SeekPage, Cursor, apId, CollectionVersionId
} from "shared";
import {collectionVersionService} from "./collection-version/collection-version.service";
import {ProjectId} from "shared";
import {CollectionEntity} from "./collection-entity";
import {paginationHelper} from "../helper/pagination/pagination-utils";
import {buildPaginator} from "../helper/pagination/build-paginator";
import { collectionRepo } from "./collection-repo";

export const collectionService = {

    /**
     * get a collection by id and versionId
     * @param id collection id to get
     * @param versionId versionId of collection to get, use 'null' for the latest version
     * @returns collection if it exists, else null
     */
    async getOne(id: CollectionId, versionId: CollectionVersionId | null): Promise<Collection | null> {
        let collection: Collection | null = await collectionRepo.findOneBy({
            id: id
        });
        if (collection === null) {
            return null;
        }
        return {
            ...collection,
            version: await collectionVersionService.getCollectionVersionId(id, versionId)
        }
    },
    async list(projectId: ProjectId, cursorRequest: Cursor | null, limit: number): Promise<SeekPage<Collection>> {
            const decodedCursor = paginationHelper.decodeCursor(cursorRequest);
            const paginator = buildPaginator({
                entity: CollectionEntity,
                paginationKeys: ["created"],
                query: {
                    limit: limit,
                    order: 'ASC',
                    afterCursor: decodedCursor.nextCursor,
                    beforeCursor: decodedCursor.previousCursor
                },
            });
            const queryBuilder = collectionRepo.createQueryBuilder("collection").where({projectId: projectId});
            const {data, cursor} = await paginator.paginate(queryBuilder.where({projectId: projectId}));
            // TODO REPLACE WITH SQL QUERY
            let collectionVersionsPromises: Promise<CollectionVersion | null>[] = [];
            data.forEach(collection => {
                collectionVersionsPromises.push(collectionVersionService.getCollectionVersionId(collection.id, null));
            });
            let versions: (CollectionVersion | null)[] = await Promise.all(collectionVersionsPromises)
            for (let i = 0; i < data.length; ++i) {
                data[i] = {...data[i], version: versions[i]};
            }
            return paginationHelper.createPage<Collection>(data, cursor);
    },


    async update(collectionId: CollectionId, request: UpdateCollectionRequest): Promise<CollectionVersion | null> {
        let lastVersion = await collectionVersionService.getCollectionVersionId(collectionId, null);
        if(lastVersion === null){
            throw new Error("There is no latest version of collection id " + collectionId);
        }
        if (lastVersion.state === CollectionVersionState.LOCKED) {
            lastVersion = await collectionVersionService.createVersion(collectionId, request);
        } else {
            await collectionVersionService.updateVersion(lastVersion, request);
        }
        return collectionVersionService.getCollectionVersionId(collectionId, null);
    },

    async create(request: CreateCollectionRequest): Promise<Collection> {
        const collection: Partial<Collection> = {
            id: apId(),
            projectId: request.projectId
        }

        let savedCollection = await collectionRepo.save(collection);
        await collectionVersionService.createVersion(savedCollection.id, {
            displayName: request.displayName,
            configs: []
        });
        return savedCollection;
    },

    async delete(collectionId: CollectionId): Promise<void> {
        await collectionRepo.delete({id: collectionId})
    }
};