addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  try {
    // 获取环境变量
    const APP_ID = FEISHU_APP_ID
    const APP_SECRET = FEISHU_APP_SECRET
    const APP_TOKEN = FEISHU_APP_TOKEN
    const TABLE_ID = FEISHU_TABLE_ID

    // 验证环境变量
    if (!APP_ID || !APP_SECRET || !APP_TOKEN || !TABLE_ID) {
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 获取访问令牌
    const token = await getAccessToken(APP_ID, APP_SECRET)
    if (!token) {
      return new Response(JSON.stringify({ error: 'Failed to get access token' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 获取表格数据
    const data = await getTableData(token, APP_TOKEN, TABLE_ID)
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function getAccessToken(appId, appSecret) {
  const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret })
  })
  
  const data = await response.json()
  return data.app_access_token
}

async function getTableData(accessToken, appToken, tableId) {
  const response = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  })
  
  const data = await response.json()
  return data.data.records || []
}
