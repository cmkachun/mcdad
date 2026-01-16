/**
 * 麦当劳深度去广告 - cmkachun
 * 策略：删除 JSON 节点，让布局自动向上坍缩
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 处理首页数据，解决那个播放一下就不动的空白位
        if (url.includes("bff/portal/home")) {
            if (obj.data && obj.data.sections) {
                obj.data.sections = obj.data.sections.filter(s => {
                    const sName = (s.sectionName || "").toLowerCase();
                    // 只要包含这些关键字的“盒子”，直接从数据里删掉
                    const isAdBox = ["video", "splash", "adv", "banner", "hot"].some(k => sName.includes(k));
                    return !isAdBox;
                });
            }
        }

        // 处理版本配置，关掉开屏开关
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
        // 如果不是 JSON，仅抹除视频链接
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");
    }
}

$done({ body });
