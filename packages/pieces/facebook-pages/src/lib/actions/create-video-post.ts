import { createAction } from "@activepieces/pieces-framework"
import { FacebookPageDropdown, facebookPagesCommon } from "../common/common";


export const createVideoPost = createAction({
    name: 'create_video_post',
    displayName: 'Create Page Video',
    description: 'Create a video on a Facebook Page you manage',
    props: {
        authentication: facebookPagesCommon.authentication,
        page: facebookPagesCommon.page,
        video: facebookPagesCommon.video,
        title: facebookPagesCommon.title,
        description: facebookPagesCommon.description
    },
    sampleData: {},

    async run(context) {
        const page: FacebookPageDropdown = context.propsValue.page!
        
        const result = await facebookPagesCommon.createVideoPost(page, context.propsValue.title, context.propsValue.description, context.propsValue.video)

        return result;
    }
});