/**
 * 麦当劳全自动去广告脚本 - cmkachun
 * 逻辑：模糊匹配所有视频后缀，彻底解决频繁更换 ID 的问题
 */

let body = $response.body;
let url = $request.url;

if (body) {
    // 1. 自动寻找并抹除 body 中所有 img.mcd.cn 下的 mp4 链接
    // 无论它是 4e94 还是 626d，只要后缀是 .mp4 都会被替换为空
    const videoPattern = /https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4(\?[^"\s]*)?/g;
    if (videoPattern.test(body)) {
        body = body.replace(videoPattern, "");
        console.log("cmkachun: 已自动拦截并抹除动态视频地址");
    }

    try {
        let obj = JSON.parse(body);

        // 2. 首页布局深度清理：通过删除数据块来隐藏空白位
        if (url.includes("bff/portal/home")) {
            if (obj.data && obj.data.sections) {
                obj.data.sections = obj.data.sections.filter(section => {
                    const sName = (section.sectionName || "").toLowerCase();
                    // 只要包含这些广告关键词的模块，直接物理删除
                    const isAd = ["video", "banner", "splash", "adv", "pop"].some(k => sName.includes(k));
                    return !isAd;
                });
            }
        }

        // 3. 模块配置清理
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
        // 解析失败则返回正则替换后的文本
    }
}

$done({ body });
