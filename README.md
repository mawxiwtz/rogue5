# Rogue 5.4.5x Japanese and WASM patch

## これは何？

[Play demo](https://mawxiwtz.github.io/rogue5/)

このプロジェクトは、[Rogue 5.4.5x](http://yozvox.web.fc2.com/526F677565.html#rogue54) について以下を行うためのパッチを作成・配布しています。

- メッセージや文字入力の日本語(UTF-8)対応
- ブラウザで遊ぶためのWASM対応

Rogue 5.4.5xは、[Rogue 5.4.4](http://rogue.rogueforge.net/rogue-5-4/) をベースに Y.Oz Vox さんが調整を行ったものです。
メッセージの日本語化にあたっては、[jRogue for macOS (日本語版 Rogue 5.4)](https://github.com/leopard-gecko/homebrew-game) のメッセージを参考にさせていただきました。メッセージは環境変数 LANG によって日本語/英語を切り替えて表示します。対応している日本語のエンコーディングは UTF-8 のみとなります。ただし必要最低限な対応にとどめているため UTF-8 のサロゲートペア文字や NFD (Normalization Form Canonical Decomposition)、Zero Width には対応していません。個人の趣味で作成した非公式なパッチのため、もしかするとオリジナルにはない不具合が出る可能性があります。

また、Web ブラウザで Rogue を動かすための WASM ファイルを Emscripten でビルドするためのパッチも配布しています。ビルドした WASM ファイルを xterm.js や xterm-pty と組み合わせることでブラウザで遊ぶことが可能となります。

## 使い方

Node.js がインストールされていれば、以下でローカルでも遊ぶことができます。

```bash
git clone https://github.com/mawxiwtz/rogue5
cd rogue5
npm install
npm run start
```

[http://localhost:3000/](http://localhost:3000/) にブラウザでアクセスしてください。

## 日本語対応版 Rogue のビルド

メッセージを日本語化します。環境変数 LANG をたとえば ja_JP.UTF-8 にすると日本語で表示されます。
en_USやCなど他のものにすると英語で表示されます。
ビルド、動作確認は、Linux でのみ行っています。Windows や Mac OS X では未確認です。確認できしだい更新予定です。

1. [Rogue 5.4.5x のソース](http://yozvox.web.fc2.com/rogue5.4.5x-src.zip)をダウンロードし、展開します。

```bash
curl -OL http://yozvox.web.fc2.com/rogue5.4.5x-src.zip
unzip rogue5.4.5x-src.zip
cd rogue5.4.5x-src
```

2. 日本語対応パッチを当ててビルドします。configure のオプションは自分の環境に合わせて適宜変更してください。

```bash
patch -p1 < ../rogue5.4.5x_ja.patch
chmod +x configure
./configure --prefix=/usr --enable-wizardmode
make
```

3. 実行します。

```bash
おすすめ
./rogue5 -24

英語版で遊びたい時
LANG=en_US ./rogue5 -24
```

遊び方やオプションの説明は以下を参考にしてください。

- [運命の洞窟へのガイド](http://yozvox.web.fc2.com/rogue54_jp.html)
- [History](http://yozvox.web.fc2.com/HistoryOfRogue.txt)

"-24" オプションの意味は Rogue 5.4.5x のソースコードに含まれる README.txt の一番最後を参照してください。

## 日本語 + WASM (Emscripten) 対応版 Rogue のビルド

こちらは日本語対応に加えて、Web ブラウザで動かす Rogue を作成するための方法です。

### 事前準備

まず、[Emscripten](https://emscripten.org/) および [Emscripten対応版 Ncurses-6.5](build_ncurses.md) を用意します。以下のとおり emcc が実行可能であることを確認します。

```bash
$ emcc --version
emcc (Emscripten gcc/clang-like replacement + linker emulating GNU ld) 4.0.11 (d3432e7a2a6585331c94b041973fb16c9f332ce4)
Copyright (C) 2025 the Emscripten authors (see AUTHORS.txt)
This is free and open source software under the MIT license.
There is NO warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
```

次に、以下のファイルも必要なためダウンロードしておきます。

- [emscripten-pty.js](https://github.com/mame/xterm-pty/raw/refs/heads/main/emscripten-pty.js) \
  [xterm-pty](https://github.com/mame/xterm-pty) が配布している、WASM 版 Rogue の画面を xterm.js で表示したり、キー入力を渡したりするために必要なスクリプトです。
- xterm-256color \
  [ncurses-6.5.tar.gz](https://invisible-island.net/archives/ncurses/ncurses-6.5.tar.gz) をビルドすると生成される。OS の /usr/share/terminfo/x/ 配下にあるものでもいいかもしれない。
- pre.js \
  以下の内容で自分で作成しておきます。

```javascript
Module['preRun'] = [
    () => {
        const url = new URL(import.meta.url);
        const dir = url.pathname.substring(0, url.pathname.lastIndexOf('/'));

        FS.mkdir('/home/web_user/.terminfo', 555);
        FS.mkdir('/home/web_user/.terminfo/x', 555);
        FS.createPreloadedFile(
            '/home/web_user/.terminfo/x',
            'xterm-256color',
            `${dir}/xterm-256color`,
            true,
            false,
        );
        FS.createPreloadedFile('/', 'rogue.ttl', `${dir}/rogue.ttl`, true, false);
    },
];
```

### ビルド

Rogue 5.4.5x のソースをダウンロードして展開します。

```bash
curl -OL http://yozvox.web.fc2.com/rogue5.4.5x-src.zip
unzip rogue5.4.5x-src.zip
cd rogue5.4.5x-src
```

日本語対応と WASM 対応のためのパッチを当てます。

```bash
patch -p1 < ../rogue5.4.5x_ja.patch
patch -p1 < ../rogue5.4.5x_emscripten.patch
```

環境変数 NCURSESDIR に、Emscripten がリンクするための [Ncurses ライブラリ](build_ncurses.md)へのパスを設定します。

```bash
export NCURSESDIR=xxxxxxx
```

emconfigure を実行します。

```bash
chmod +x configure
emconfigure ./configure \
  --prefix=/usr \
  --enable-wizardmode \
  CFLAGS="-I${NCURSESDIR}/usr/include" \
  LDFLAGS="-L${NCURSESDIR}/usr/lib" \
  --with-js-library=../emscripten-pty.js \
  --with-pre-js=../pre.js
```

ビルドします。

```bash
emmake make
```

rogue5.mjs と rogue5.wasm が作成されれば成功です。\
以下のような HTML を index.html という名前で用意し、lib ディレクトリ配下に rogue5.mjs、rogue5.wasm、rogue.ttl (Rogue 5.4.5x のソースに含まれています)、xterm-256color を配置します。Webサーバを起動し、index.html にアクセスすると Rogue の画面が表示されます。なお、ローカルで index.html を開いても動作しません。

```html
<!doctype html>
<html>
    <head>
        <meta charset="utf-8" />
        <link rel="icon" href="./lib/rogue.png" type="image/png" />
        <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/css/xterm.min.css"
        />
    </head>

    <body>
        <div id="container">
            <h1>Rogue 5.4.5x WASM</h1>
            <div id="terminal"></div>
            <div class="info">
                <img
                    src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/github.svg"
                    alt="GitHub Logo"
                    width="32"
                    height="32"
                />
                <a href="https://github.com/mawxiwtz/rogue5">https://github.com/mawxiwtz/rogue5</a>
            </div>
        </div>
        <script type="module">
            import { Terminal } from 'https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/+esm';
            import { FitAddon } from 'https://cdn.jsdelivr.net/npm/@xterm/addon-fit@0.10.0/+esm';
            import { openpty } from 'https://cdn.jsdelivr.net/npm/xterm-pty@0.11.1/+esm';
            import initEmscripten from './lib/rogue5.mjs';

            const xterm = new Terminal({
                cols: 80,
                rows: 24,
                fontSize: 14,
            });
            xterm.open(document.getElementById('terminal'));

            const fitAddon = new FitAddon();
            xterm.loadAddon(fitAddon);

            const { master, slave } = openpty();

            xterm.loadAddon(master);
            xterm.focus();

            await initEmscripten({
                pty: slave,
                arguments: ['-24'],
            });
        </script>
        <style>
            body {
                color: white;
                margin: 0px 0px;
                background-color: #202020;
            }
            a {
                text-decoration: none;
            }
            a:link {
                color: #e0e0e0;
            }
            a:hover {
                color: #f0f0ff;
            }
            a:visited {
                color: #f0f0e0;
            }
            div#container {
                width: 100vw;
                margin: 32px auto;
            }
            div.info {
                margin: 32px auto;
                text-align: center;
            }
            div.info > img {
                filter: invert(100%);
            }
            h1 {
                margin: 16px auto;
                text-align: center;
            }
            div#terminal {
                width: 42em;
                margin: 0px auto;
            }
        </style>
    </body>
</html>
```

##　おまけ

自分はモンスター名や武器名を自分好みにしたいため以下のパッチもあてました。これは好みですのであてなくても構いません。

```bash
patch -p1 < ../rogue5.4.5x_ja_rename.patch
```

環境によっては、Ctrl+H による移動がうまく効かない場合があリます。その時は次のパッチをあててください。

```bash
patch -p1 < ../rogue5.4.5x_ctrl-h.patch
```
