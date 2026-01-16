/**
 * 麦当劳去广告脚本 - cmkachun
 * 策略：根据图片 ID 物理隐藏容器，彻底解决空白位
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);
        const adKeywords = ["video", "banner", "splash", "adv", "hot", "marketing", "pop", "float", "remind"];
        const targetImgs = ["dd9407f36a1db737", "3c6b06647db3f7f1"];

        // 首页及活动内容接口处理
        if (url.includes("/bff/portal/home") || url.includes("/bff/mcbook/content/")) {
            if (obj.data && (obj.data.sections || obj.data.modules)) {
                const filter = (items) => (items || []).filter(item => {
                    const name = (item.sectionName || item.moduleName || "").toLowerCase();
                    const raw = JSON.stringify(item);
                    return !adKeywords.some(k => name.includes(k)) && !targetImgs.some(img => raw.includes(img));
                });
                if (obj.data.sections) obj.data.sections = filter(obj.data.sections);
                if (obj.data.modules) obj.data.modules = filter(obj.data.modules);
            }
        }

        // 版本配置清理
        if (url.includes("/bff/portal/version/mdl")) {
            if (obj.data && obj.data.modules) {
                obj.data.modules = obj.data.modules.filter(m => !["splash", "pop", "adv", "video"].some(k => (m.moduleName || "").toLowerCase().includes(k)));
            }
            if (obj.hasOwnProperty('audit')) obj.audit = true;
        }

        body = JSON.stringify(obj);
    } catch (e) {
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.(mp4|jpg|gif)/g, "");
    }
}

$done({ body });
