/**
 * 麦当劳通用去广告脚本 (自动化版) - cmkachun
 * 逻辑：自动识别并抹除所有 mp4 视频资源链接
 */

let body = $response.body;
let url = $request.url;

if (body) {
    // 1. 动态抹除所有以 img.mcd.cn 开头的 mp4 链接
    // 无论它换成什么随机字符，只要后缀是 .mp4 都会被替换
    const videoRegex = /https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g;
    if (videoRegex.test(body)) {
        body = body.replace(videoRegex, "");
        console.log("cmkachun: 已动态抹除视频地址");
    }

    // 2. 针对配置接口的模块清理
    if (url.includes("bff/portal/version/mdl")) {
        try {
            let obj = JSON.parse(body);
            if (obj.data && obj.data.modules) {
                // 过滤掉所有可能包含开屏资源的模块
                const blacklist = ["splash", "ad", "video", "pop", "guide"];
                obj.data.modules = obj.data.modules.filter(m => {
                    const mName = (m.moduleName || "").toLowerCase();
                    return !blacklist.some(k => mName.includes(k));
                });
            }
            // 尝试开启审核模式（部分版本有效）
            if (obj.hasOwnProperty('audit')) obj.audit = true;
            body = JSON.stringify(obj);
        } catch (e) {}
    }
}

$done({ body });
