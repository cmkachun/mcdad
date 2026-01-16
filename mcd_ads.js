/**
 * 麦当劳布局净化脚本 - cmkachun
 * 策略：保留功能图标容器，仅抹除其中的广告链接和纯广告模块
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 1. 处理首页门户数据
        if (url.includes("/bff/portal/home")) {
            if (obj.data && obj.data.sections) {
                const adKeywords = ["video", "banner", "splash", "adv", "marketing", "pop", "indexvideo"];
                
                obj.data.sections = obj.data.sections.filter(s => {
                    const name = (s.sectionName || "").toLowerCase();
                    const raw = JSON.stringify(s);
                    
                    // 特别保护：如果包含 .png 且不是明确的广告词，则必须保留此模块以显示图标
                    if (raw.includes(".png") && !["splash", "video", "pop"].some(k => name.includes(k))) {
                        return true;
                    }
                    
                    // 过滤掉纯广告模块
                    return !adKeywords.some(k => name.includes(k));
                });
            }
        }

        // 2. 预下载链接抹除 (不删除节点，只破坏广告 URL)
        const scrubLinks = (target) => {
            if (typeof target === 'string') {
                if (target.includes("img.mcd.cn") && (target.includes("splash") || target.includes("pop"))) {
                    return "https://raw.githubusercontent.com/cmkachun/mcdad/main/pixel.png";
                }
            } else if (Array.isArray(target)) {
                return target.map(scrubLinks);
            } else if (typeof target === 'object' && target !== null) {
                for (let key in target) {
                    target[key] = scrubLinks(target[key]);
                }
            }
            return target;
        };
        obj = scrubLinks(obj);

        // 3. 开启审核模式
        if (obj.hasOwnProperty('audit')) obj.audit = true;

        body = JSON.stringify(obj);
    } catch (e) {
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");
    }
}

$done({ body });
