/**
 * 麦当劳去广告脚本 - cmkachun
 * 逻辑：移除开屏模块数据，放行图标
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 1. 处理配置接口：直接删除所有开屏相关的模块定义
        if (url.includes("bff/portal/version/mdl")) {
            if (obj.data && obj.data.modules) {
                const blacklist = ["splash", "pop", "adv", "video", "guide"];
                obj.data.modules = obj.data.modules.filter(m => {
                    const mName = (m.moduleName || "").toLowerCase();
                    // 只要名字里包含这些，直接移除该模块数据
                    return !blacklist.some(k => mName.includes(k));
                });
            }
            if (obj.hasOwnProperty('audit')) obj.audit = true;
        }

        // 2. 处理首页接口：彻底删除视频占位符所在的 section
        if (url.includes("bff/portal/home")) {
            if (obj.data && obj.data.sections) {
                obj.data.sections = obj.data.sections.filter(s => {
                    const sName = (s.sectionName || "").toLowerCase();
                    // 移除视频容器和开屏容器
                    const isAd = ["video", "splash", "adv", "pop"].some(k => sName.includes(k));
                    return !isAd;
                });
            }
        }

        body = JSON.stringify(obj);
    } catch (e) {
        // 如果是纯文本链接替换，只替换 mp4，不动 gif
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");
    }
}

$done({ body });
