module.exports = function mikserPlugin({ mikser, token, uri }) {
    return  (incomingConfig) => {
        const config = {
            ...incomingConfig,
            collections: (incomingConfig.collections || []).map((collection) => {
                const headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
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
                            await fetch(url, {
                                method: 'POST',
                                headers,
                                body: JSON.stringify(doc)
                            })
                        } catch (err) {
                            payload?.logger.error('Mikser api create error: %s %s %s', url, doc.id, err.message)
                        }
                    } else {
                        try {
                            payload?.logger.info('Mikser api update: %s %s', url, doc.id)
                            await fetch(url, {
                                method: 'PUT',
                                headers,
                                body: JSON.stringify(doc)
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
                        await fetch(url, {
                            method: 'DELETE',
                            headers,
                            body: JSON.stringify(doc)
                        })
                    } catch (err) {
                        payload?.logger.error('Mikser api delete error: %s %s %s', url, doc.id, err.message)
                    }
                })

                return collection
            }),
            globals: (incomingConfig.globals || []).map((global) => {
                const headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
                const url = `${mikser}/api/webhooks/global-${global.slug}`
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`
                }
                global.hooks ||= {}
                global.hooks.afterChange ||= []
                global.hooks.afterChange.push(async ({ doc, req, operation }) => {
                    const { payload } = req
                    if (operation == 'create') {
                        try {
                            payload?.logger.info('Mikser api create: %s %s', url, doc.id)
                            await fetch(url, {
                                method: 'POST',
                                headers,
                                body: JSON.stringify(doc)
                            })
                        } catch (err) {
                            payload?.logger.error('Mikser api create error: %s %s %s', url, doc.id, err.message)
                        }
                    } else {
                        try {
                            payload?.logger.info('Mikser api update: %s %s', url, doc.id)
                            await fetch(url, {
                                method: 'PUT',
                                headers,
                                body: JSON.stringify(doc)
                            })
                        } catch (err) {
                            payload?.logger.error('Mikser api update error: %s %s %s', url, doc.id, err.message)
                        }
                    }
                })

                global.hooks.afterDelete ||= []
                global.hooks.afterDelete.push(async ({ doc, req }) => {
                    const { payload } = req
                    try {
                        payload?.logger.info('Mikser api delete: %s %s', url, doc.id)
                        await fetch(url, {
                            method: 'DELETE',
                            headers,
                            body: JSON.stringify(doc)
                        })
                    } catch (err) {
                        payload?.logger.error('Mikser api delete error: %s %s %s', url, doc.id, err.message)
                    }
                })

                return global
            }),
        }
    
        const onInit = config.onInit || (() => {})
        config.onInit = async (payload) => {
            await onInit(payload)

            const url = `${mikser}/api/webhooks/schedule`
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }
            try {
                payload?.logger.info('Mikser api schedule: %s', url)
                await fetch(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        uri: uri || incomingConfig.serverURL
                    })
                })
            } catch (err) {
                payload?.logger.error('Mikser api schedule error: %s %s', url, err.message)
            }
        }
        return config
    }
}