/**
 * 麦当劳通用去广告脚本 - 已适配 api2.mcd.cn
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 1. 深度清理首页布局（解决空白占位）
        if (url.includes("/bff/portal/home")) {
            if (obj.data && obj.data.sections) {
                obj.data.sections = obj.data.sections.filter(s => {
                    const sName = (s.sectionName || "").toLowerCase();
                    // 彻底删除视频和广告容器
                    return !["video", "splash", "adv", "banner", "hot"].some(k => sName.includes(k));
                });
            }
        }

        // 2. 模块配置清理
        if (url.includes("/bff/portal/version/mdl")) {
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
        // 如果不是 JSON，尝试全域抹除视频链接
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");
    }
}

$done({ body });
