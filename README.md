> 脚手架学习项目，待更新

# chtty-cli

- 创建项目
  - 脚本入口
- 开发
  - 链接包到全局下使用
- 解析命令行参数
  - commander ：参数解析 --help
  - 配置命令
- 编写 create 文件
  - 拉取项目
    - 建立 chtty-cli 模版组织仓库
    - npm i axios
  - inquirer & ora
    - npm i inquirer ora
      - inquirer ：交互式命令行工具
      - ora loading
    - 建立拉取交互选择
  - 下载项目
    - npm i download-git-repo
      - download-git-repo ：在 git 中下载模板
    - 临时目录来存放下载的文件
      - 将文件下载到当前用户下的.template 文件中
    - 拷贝
      - npm i ncp
- 模板编译
  - npm i metalsmith ejs consolidate
    - metalsmith ：读取所有文件,实现模板渲染
    - consolidate ：统一模板引擎
- 项目发布
  - nrm use npm
  - npm publish
