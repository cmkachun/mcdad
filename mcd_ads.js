/**
 * 麦当劳首页 PNG/GIF 广告位物理蒸发脚本 - cmkachun
 * 策略：删除 JSON 节点，让布局向上坍缩，不产生空白位
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 1. 处理所有首页和内容接口 (适配 api2 和 mcbook)
        if (url.includes("/bff/portal/home") || url.includes("/bff/mcbook/content/")) {
            if (obj.data && (obj.data.sections || obj.data.modules)) {
                // 定义广告位黑名单关键词
                const blacklist = ["video", "banner", "splash", "adv", "hot", "marketing", "pop", "float", "indexvideo"];
                
                const filterItems = (items) => {
                    return items.filter(item => {
                        const name = (item.sectionName || item.moduleName || "").toLowerCase();
                        const type = (item.sectionType || "").toLowerCase();
                        // 检查名字、类型，或是否包含你抓到的那个特定广告图片 ID
                        const rawData = JSON.stringify(item);
                        const isAd = blacklist.some(k => name.includes(k) || type.includes(k)) || 
                                     rawData.includes("dd9407f36a1db737"); // 精准锁定你刚才发的那个图片
                        
                        if (isAd) console.log(`cmkachun: 已物理移除首页广告容器 [${name || '未知'}]`);
                        return !isAd;
                    });
                };

                if (obj.data.sections) obj.data.sections = filterItems(obj.data.sections);
                if (obj.data.modules) obj.data.modules = filterItems(obj.data.modules);
            }
        }

        // 2. 版本配置清理
        if (url.includes("/bff/portal/version/mdl")) {
            if (obj.data && obj.data.modules) {
                obj.data.modules = obj.data.modules.filter(m => {
                    const mName = (m.moduleName || "").toLowerCase();
                    return !["splash", "pop", "adv", "video", "guide"].some(k => mName.includes(k));
                });
            }
            if (obj.hasOwnProperty('audit')) obj.audit = true;
        }

        body = JSON.stringify(obj);
    } catch (e) {
        // 兜底：抹除所有 mp4 地址，但不抹除图片链接（防止误伤 UI）
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");
    }
}

$done({ body });
