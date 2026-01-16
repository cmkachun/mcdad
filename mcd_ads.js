/**
 * 麦当劳去广告脚本 - 修复图片显示
 */

let body = $response.body;
let url = $request.url;

if (body) {
    // 仅抹除 mp4 链接，保留 jpg/png 等图片链接
    const videoRegex = /https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g;
    if (videoRegex.test(body)) {
        body = body.replace(videoRegex, "");
    }

    if (url.includes("bff/portal/version/mdl")) {
        try {
            let obj = JSON.parse(body);
            if (obj.data && obj.data.modules) {
                // 只移除明确的开屏和弹窗模块，不移除 home 模块
                const blacklist = ["splash", "pop", "adv-video"];
                obj.data.modules = obj.data.modules.filter(m => {
                    const mName = (m.moduleName || "").toLowerCase();
                    return !blacklist.some(k => mName.includes(k));
                });
            }
            if (obj.hasOwnProperty('audit')) obj.audit = true;
            body = JSON.stringify(obj);
        } catch (e) {}
    }
}

$done({ body });
