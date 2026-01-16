/**
 * 麦当劳深度去广告脚本 - 适配 api2 全局拦截
 * cmkachun
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 1. 自动处理所有包含 sections 的接口 (首页、菜单等)
        // 只要发现是广告、视频、Banner 类型的模块，统统删除
        const removeAdSections = (sections) => {
            if (!sections) return [];
            const blacklist = ["video", "splash", "adv", "banner", "hot", "pop", "float"];
            return sections.filter(s => {
                const name = (s.sectionName || s.moduleName || "").toLowerCase();
                const isAd = blacklist.some(k => name.includes(k));
                if (isAd) console.log(`cmkachun: 已物理移除广告位: ${name}`);
                return !isAd;
            });
        };

        if (obj.data) {
            if (obj.data.sections) obj.data.sections = removeAdSections(obj.data.sections);
            if (obj.data.modules) obj.data.modules = removeAdSections(obj.data.modules);
        }

        // 2. 强制开启审计/审核模式
        if (obj.hasOwnProperty('audit')) obj.audit = true;

        body = JSON.stringify(obj);
    } catch (e) {
        // 如果不是标准 JSON，执行强制字符串替换，破坏视频链接
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");
    }
}

$done({ body });
