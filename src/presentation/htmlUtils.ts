// Create webview content with the folder list
export function createWebviewContent(folderList: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Flutter Tree</title>
      <style>
        ul {
          list-style-type: none;
          padding-left: 0;
        }
        ul ul {
          padding-left: 20px;
        }
        li {
          margin-left: 20px;
          margin-bottom: 5px;
        }
      </style>
    </head>
    <body>
      <h1>Directory Structure:</h1>
      ${folderList}
    </body>
    </html>
  `;
}
