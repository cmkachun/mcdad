/**
 * 麦当劳首页 GIF 精准去广告脚本 - cmkachun
 * 目标：拦截 3c6b...gif 并物理隐藏其所在的容器
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 1. 处理首页及活动内容接口
        if (url.includes("/bff/portal/home") || url.includes("/bff/mcbook/content/")) {
            if (obj.data && (obj.data.sections || obj.data.modules)) {
                // 定义黑名单：关键字匹配 + 特定图片匹配
                const blacklist = ["video", "banner", "splash", "adv", "hot", "marketing", "pop", "float", "remind"];
                const targetImgs = ["dd9407f36a1db737", "3c6b06647db3f7f1"]; // 加入新的 GIF ID

                const filterItems = (items) => {
                    return (items || []).filter(item => {
                        const name = (item.sectionName || item.moduleName || "").toLowerCase();
                        const rawData = JSON.stringify(item);
                        
                        // 如果名字命中关键字，或者数据中包含特定的广告图片链接，则删除
                        const isAd = blacklist.some(k => name.includes(k)) || 
                                     targetImgs.some(img => rawData.includes(img));
                        
                        if (isAd) console.log(`cmkachun: 已物理移除包含广告图片的模块 [${name || '未知'}]`);
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
                obj.data.modules = obj.data.modules.filter(m => !["splash", "pop", "adv", "video"].some(k => (m.moduleName || "").toLowerCase().includes(k)));
            }
            if (obj.hasOwnProperty('audit')) obj.audit = true;
        }

        body = JSON.stringify(obj);
    } catch (e) {
        // 兜底：抹除所有视频和特定广告图片链接
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.(mp4|jpg|gif)/g, (match) => {
            return match.includes("3c6b06647db3f7f1") ? "" : match;
        });
    }
}

$done({ body });
