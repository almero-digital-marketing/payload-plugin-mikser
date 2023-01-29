
import mikserWebhooks from 'mikser-io-webhooks'

export default ({ url, token, uri }) => {
    return (incomingConfig) => {      
        const config = {
            ...incomingConfig,
            collections: (incomingConfig.collections || []).map((collection) => {
                collection.hooks ||= {}
    
                collection.hooks.afterChange ||= []
                collection.hooks.afterChange.push(async ({ doc, req, operation }) => {
                    const { payload } = req
                    const webhooks = mikserWebhooks({ url, token, logger: payload?.logger })
                
                    if (operation == 'create') {
                        webhooks.created(collection.slug, doc)
                    } else if (operation == 'update') {
                        webhooks.updated(collection.slug, doc)
                    }
                })
    
                collection.hooks.afterDelete ||= []
                collection.hooks.afterDelete.push(async ({ doc, req }) => {
                    const { payload } = req
                    const webhooks = mikserWebhooks({ url, token, logger: payload?.logger })
                    webhooks.deleted(collection.slug, doc)
                })
    
                return collection
            }),
            globals: (incomingConfig.globals || []).map((global) => {
                global.hooks ||= {}
                global.hooks.afterChange ||= []
                global.hooks.afterChange.push(async ({ doc, req }) => {
                    const { payload } = req
                    const webhooks = mikserWebhooks({ url, token, logger: payload?.logger })
                    webhooks.updated('global-' + collection.slug, doc)
                })
    
                return global
            }),
        }
    
        const onInit = config.onInit || (() => {})
        config.onInit = async (payload) => {
            await onInit(payload)
    
            const webhooks = mikserWebhooks({ url, token, logger: payload?.logger })
            webhooks.trigger(uri || incomingConfig.serverURL)
        }
        return config
    }
}