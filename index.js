
import useMikserWebhooks from 'mikser-io-webhooks'
import useMikserSocket from 'mikser-io-socket'

let mikserWebhooks, mikserSocket

export default ({ url, token, uri }) => {
    return (incomingConfig) => {      
        const config = {
            ...incomingConfig,
            collections: (incomingConfig.collections || []).map((collection) => {
                collection.hooks ||= {}
    
                collection.hooks.afterChange ||= []
                collection.hooks.afterChange.push(async ({ doc, req, operation }) => {
                    if (operation == 'create') {
                        mikserWebhooks.created(collection.slug, doc)
                        mikserSocket.created(collection.slug, doc)
                    } else if (operation == 'update') {
                        mikserWebhooks.updated(collection.slug, doc)
                        mikserSocket.updated(collection.slug, doc)
                    }
                })
    
                collection.hooks.afterDelete ||= []
                collection.hooks.afterDelete.push(async ({ doc, req }) => {
                    mikserWebhooks.deleted(collection.slug, doc)
                    mikserSocket.deleted(collection.slug, doc)
                })
    
                return collection
            }),
            globals: (incomingConfig.globals || []).map((global) => {
                global.hooks ||= {}
                global.hooks.afterChange ||= []
                global.hooks.afterChange.push(async ({ doc, req }) => {
                    mikserWebhooks.updated('global-' + collection.slug, doc)
                    mikserSocket.updated('global-' + collection.slug, doc)
                })
    
                return global
            }),
        }
    
        const onInit = config.onInit || (() => {})
        config.onInit = async (payload) => {
            await onInit(payload)
    
            mikserWebhooks = useMikserWebhooks({ url, token, logger: payload?.logger })
            await mikserWebhooks.trigger(uri || incomingConfig.serverURL)

            mikserSocket = useMikserSocket({ url, token, server: payload.server, logger: payload?.logger })
            await mikserSocket.trigger(uri || incomingConfig.serverURL)
        }
        return config
    }
}