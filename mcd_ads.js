/**
 * 麦当劳首页空白隐藏脚本 - cmkachun
 */

let body = $response.body;
let url = $request.url;

if (body) {
    // 1. 物理抹除所有 mp4 地址
    body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");

    try {
        let obj = JSON.parse(body);

        // 2. 针对首页数据接口进行布局隐藏
        if (url.includes("bff/portal/home")) {
            if (obj.data && obj.data.sections) {
                // 过滤首页所有小节，剔除包含视频、开屏、动态广告的 section
                obj.data.sections = obj.data.sections.filter(section => {
                    const sectionName = (section.sectionName || "").toLowerCase();
                    const isAd = ["video", "splash", "adv", "banner", "pop"].some(k => sectionName.includes(k));
                    if (isAd) console.log(`cmkachun: 已隐藏首页空白位 [${sectionName}]`);
                    return !isAd;
                });
            }
        }

        // 3. 针对版本配置接口进行剔除
        if (url.includes("bff/portal/version/mdl")) {
            if (obj.data && obj.data.modules) {
                const blacklist = ["splash", "pop", "adv", "video", "guide"];
                obj.data.modules = obj.data.modules.filter(m => {
                    const mName = (m.moduleName || "").toLowerCase();
                    return !blacklist.some(k => mName.includes(k));
                });
            }
            if (obj.hasOwnProperty('audit')) obj.audit = true;
        }

        body = JSON.stringify(obj);
    } catch (e) {
        console.log("cmkachun: 布局隐藏脚本执行异常");
    }
}

$done({ body });
