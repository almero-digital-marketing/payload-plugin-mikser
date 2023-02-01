
import useMikserWebhooks from 'mikser-io-webhooks'
import useMikserSubscribe from 'mikser-io-subscribe'

let mikserWebhooks, mikserSubscribe

export default ({ url, token, uri, port }) => {
    return (incomingConfig) => {      
        const config = {
            ...incomingConfig,
            collections: (incomingConfig.collections || []).map((collection) => {
                collection.hooks ||= {}
    
                collection.hooks.afterChange ||= []
                collection.hooks.afterChange.push(async ({ doc, req, operation }) => {
                    if (operation == 'create') {
                        await mikserWebhooks?.created(collection.slug, doc)
                        mikserSubscribe?.created(collection.slug, doc)
                    } else if (operation == 'update') {
                        await mikserWebhooks?.updated(collection.slug, doc)
                        mikserSubscribe?.updated(collection.slug, doc)
                    }
                })
    
                collection.hooks.afterDelete ||= []
                collection.hooks.afterDelete.push(async ({ doc, req }) => {
                    await mikserWebhooks?.deleted(collection.slug, doc)
                    mikserSubscribe?.deleted(collection.slug, doc)
                })
    
                return collection
            }),
            globals: (incomingConfig.globals || []).map((global) => {
                global.hooks ||= {}
                global.hooks.afterChange ||= []
                global.hooks.afterChange.push(async ({ doc, req }) => {
                    await mikserWebhooks?.updated('globals', doc)
                    mikserSubscribe?.updated('globals', doc)
                })
    
                return global
            }),
        }
    
        const onInit = config.onInit || (() => {})
        config.onInit = async (payload) => {
            await onInit(payload)
    
            mikserWebhooks = useMikserWebhooks({ url, token, logger: payload?.logger })
            mikserSubscribe = useMikserSubscribe({ url, token, port, logger: payload?.logger })
            
            await mikserWebhooks?.trigger(uri || incomingConfig.serverURL)
        }
        return config
    }
}