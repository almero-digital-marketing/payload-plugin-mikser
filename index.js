import axios from 'axios'

export default function mikserPlugin({ mikser, token }) {
    return  (incomingConfig) => {
        const config = {
            ...incomingConfig,
            collections: incomingConfig.collections.map((collection) => {
                const headers = {}
                const url = `${mikser}/api/webhooks/${collection.slug}`
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`
                }
                collection.hooks ||= {}
                collection.hooks.afterChange ||= []
                collection.hooks.afterChange.push(async ({ doc, req, operation }) => {
                    const { payload } = req
                    if (operation == 'create') {
                        try {
                            payload?.logger.info('Mikser api create: %s %s', url, doc.id)
                            await axios.request({
                                method: 'post',
                                url,
                                headers,
                                data: doc
                            })
                        } catch (err) {
                            payload?.logger.error('Mikser api create error: %s %s %s', url, doc.id, err.message)
                        }
                    } else {
                        try {
                            payload?.logger.info('Mikser api update: %s %s', url, doc.id)
                            await axios.request({
                                method: 'put',
                                url,
                                headers,
                                data: doc
                            })
                        } catch (err) {
                            payload?.logger.error('Mikser api update error: %s %s %s', url, doc.id, err.message)
                        }
                    }
                })

                collection.hooks.afterDelete ||= []
                collection.hooks.afterDelete.push(async ({ doc, req }) => {
                    const { payload } = req
                    try {
                        payload?.logger.info('Mikser api delete: %s %s', url, doc.id)
                        await axios.request({
                            method: 'delete',
                            url,
                            headers,
                            data: doc
                        })
                    } catch (err) {
                        payload?.logger.error('Mikser api delete error: %s %s %s', url, doc.id, err.message)
                    }
                })

                return collection
            })
        }
    
        return config
    }
}