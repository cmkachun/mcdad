/**
 * 麦当劳 PNG 开屏去广告脚本 - cmkachun
 * 逻辑：只移除作为开屏/广告用途的图片链接，保留正常 UI 按钮
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);
        const adKeywords = ["splash", "video", "banner", "adv", "marketing", "pop", "remind"];

        // 1. 深度清理首页及模块数据
        const deepClean = (target) => {
            if (Array.isArray(target)) {
                return target.filter(item => {
                    const name = (item.sectionName || item.moduleName || "").toLowerCase();
                    const raw = JSON.stringify(item);
                    // 只要模块名包含广告关键词，或包含之前抓到的特定广告图，直接删除整块
                    return !adKeywords.some(k => name.includes(k)) && 
                           !raw.includes("dd9407f36a1db737") && 
                           !raw.includes("3c6b06647db3f7f1");
                }).map(deepClean);
            } else if (typeof target === 'object' && target !== null) {
                for (let key in target) {
                    // 如果字段名本身就是广告类图片链接，直接设为空串
                    if (adKeywords.some(k => key.toLowerCase().includes(k)) && typeof target[key] === 'string') {
                        if (target[key].includes(".png") || target[key].includes(".jpg")) {
                            target[key] = "";
                        }
                    }
                    target[key] = deepClean(target[key]);
                }
            }
            return target;
        };

        if (obj.data) obj.data = deepClean(obj.data);
        
        // 2. 强制开启审核模式 (隐藏部分动态广告)
        if (obj.hasOwnProperty('audit')) obj.audit = true;

        body = JSON.stringify(obj);
    } catch (e) {
        // 兜底正则：仅破坏 mp4，png 交给 JSON 逻辑处理以防误伤
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");
    }
}

$done({ body });
