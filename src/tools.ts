

import { createTwoFilesPatch, diffWords } from 'diff'; // 用于生成 diff 数据
import { html } from 'diff2html'; // 用于将 diff 数据转换为 HTML
import 'diff2html/bundles/css/diff2html.min.css'; // 引入 Diff2Html 的样式
import { toBlob } from 'html-to-image';

export function generateDiffHtml(fieldName1: string, fieldName2: string, text1: string, text2: string) {
    // 使用 diff 库生成差异数据
    const diffResult = createTwoFilesPatch(fieldName1, fieldName2, text1, text2);

    // 使用 diff2html 库将差异数据转换为 HTML
    const diffHtml = html(diffResult, {
        drawFileList: false, // 不显示文件列表
        outputFormat: 'side-by-side', // 侧边显示 diff
        matching: 'lines', // 基于行的比较
        renderNothingWhenEmpty: true,
        // highlight: true, // 启用语法高亮
    });

    // 返回生成的 HTML
    return diffHtml;
}


// 工具函数：生成多行文本的差异 HTML
// export function generateDiffHtml(text1: string, text2: string) {
//     const diffResult = diffWords(text1, text2);  // 使用 diffLines 比较多行文本

//     console.log('diffResult', diffResult)

//     if (!diffResult.length) return ''

//     let htmlContent = `
//     <div id="diff-container" style="font-family: Arial, sans-serif; padding: 10px; line-height: 1.5em;">
//         <pre style="white-space: pre-wrap;">`;  // 使用 <pre> 标签保持格式

//     diffResult.forEach(part => {
//         if (part.added) {
//             htmlContent += `<span style="background-color: #d4fcbc;">${part.value}</span>`;
//         } else if (part.removed) {
//             htmlContent += `<span style="background-color: #fbb6c2;">${part.value}</span>`;
//         } else {
//             htmlContent += part.value;
//         }
//     });
//     htmlContent += `</pre></div>`;

//     return htmlContent;
// }

let count = 1

// 将 HTML 渲染为图片并下载或上传
export async function renderHtmlAndGenImageFile(htmlContent: string) {
    try {
        // 创建一个容器用于渲染 HTML
        const container = document.createElement('div');
        container.innerHTML = htmlContent;
        document.body.appendChild(container);

        // 使用 toBlob 方法将 HTML 渲染为 Blob 对象
        const blob = await toBlob(container);

        if (!blob) return null;

        // 使用 Blob 对象创建一个 File 实例
        const file = new File([blob], `diffImage${Date.now()}-${count}.png`, { type: 'image/png' });

        // 移除容器
        document.body.removeChild(container);

        return file;
    } catch (error) {
        console.error('Error converting HTML to file:', error);
        return null;
    }
}