import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Collection, CollectionVersion } from '../model/collection.interface';
import { Observable } from 'rxjs';
import { SeekPage } from '../model/seek-page';
import { UUID } from 'angular2-uuid';
import { CodeService } from '../../flow-builder/service/code.service';
import { InstanceStatus } from '../model/enum/instance-status';
import { Instance } from '../model/instance.interface';
@Injectable({
	providedIn: 'root',
})
export class CollectionService {
	constructor(private http: HttpClient, private codeService: CodeService) {
		this.codeService;
	}

	create(
		projectId: UUID,
		collection: {
			display_name: string;
		}
	): Observable<Collection> {
		return this.http.post<Collection>(environment.apiUrl + '/projects/' + projectId + '/collections', collection);
	}

	update(collectionId: UUID, collection: CollectionVersion): Observable<Collection> {
		const updateCollection$ = this.http.put<Collection>(environment.apiUrl + '/collections/' + collectionId, {
			display_name: collection.display_name,
			configs: collection.configs,
		});
		return updateCollection$;
	}

	getVersion(versionId: UUID): Observable<CollectionVersion> {
		return this.http.get<CollectionVersion>(environment.apiUrl + '/collection-versions/' + versionId);
	}

	listVersions(pieceId: UUID): Observable<CollectionVersion[]> {
		return this.http.get<CollectionVersion[]>(environment.apiUrl + '/collections/' + pieceId + '/versions/', {});
	}

	lock(pieceId: UUID): Observable<Collection> {
		return this.http.post<Collection>(environment.apiUrl + '/collections/' + pieceId + '/commit', {});
	}

	get(pieceId: UUID): Observable<Collection> {
		return this.http.get<Collection>(environment.apiUrl + '/collections/' + pieceId);
	}

	list(projectId: string, params: { pageSize: number; cursor: string }): Observable<SeekPage<Collection>> {
		const queryParams: { [key: string]: string | number } = {};
		queryParams['limit'] = params.pageSize;
		if (params.cursor) {
			queryParams['cursor'] = params.cursor;
		}
		return this.http.get<SeekPage<Collection>>(environment.apiUrl + '/projects/' + projectId + '/collections', {
			params: queryParams,
		});
	}

	archive(pieceId: UUID): Observable<void> {
		return this.http.delete<void>(environment.apiUrl + '/collections/' + pieceId);
	}
	deploy(collection_id: UUID): Observable<Instance> {
		return this.http.post<Instance>(environment.apiUrl + `/collections/${collection_id}/instance`, {
			status: InstanceStatus.ENABLED,
		});
	}
}