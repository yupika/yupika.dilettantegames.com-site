<script>
import steamlib from '$lib/monooki/golocal.png';
import peter from '$lib/monooki/peternihongo.png'
import steamlink from '$lib/monooki/steamlink.png'

</script>

<svelte:head>
	<title>The Case of the Golden Idol:JA</title>
	<meta name="description" content="The Case of the Golden Idol日本語版" />
</svelte:head>

<div class="alert alert-warning">
	<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
	<span>DLC部分に対応したバージョンになりました。</span>
</div>




<div class="py-10 rounded-lg bg-gradient-to-r from-red-50 to-blue-100 hero min-h-fit">
	<div class="hero-content ">
		<div>
			<h2 class="text-5xl font-bold">The Case of the Golden Idolの日本語化について</h2>
			<div class="max-w-md">
				<img src={peter} class="max-w-md rounded-lg shadow-2x1" alt="peter"/>
			</div>
		</div>
		<article class="prose">
			<h2 id="ゲームに関して">ゲームに関して</h2>
			<p>The Case of the Golden Idolはミステリー小説そのものをゲーム（ただし、小説の下位互換となるテキストを読ませるだけのものではない）にしたようなゲームで、探偵ごっこができるいいゲームです。</p>
			<p>18世紀のイギリスっぽいところを舞台にしていて、雰囲気の面白みもたっぷりです。</p>
			<p>今回、英語が読めないと面白さを得るまでのハードルが高いゲームである本作を日本語にしました。<br>
			ある種の普遍性がありゲーム好きな人以外の鑑賞にも耐えうる優れた作品なので、できるだけ広く遊んでほしい、なので本ページでは適用方法まで丁寧に書いています。</p>
		</article>
	</div>
</div>
	<div>
		<article class="py-10 prose">
			<h2>まず買います。</h2>
			<a href="https://store.steampowered.com/app/1677770/The_Case_of_the_Golden_Idol/">
			<img class="min-w-full" src={steamlink} alt="steamlink" />
			</a>
		</article>
		<article class="prose lg:prose-xl">
			<h2 id="日本語化について">日本語化について</h2>
			<p>雰囲気とゲームとしての目的重視で大体は日本語にしています。</p>
			<p>俺のローカライズ能力がすごいレベルなのでもはや最初から存在した日本語版って感じです。</p>
			<p>とはいえ、一人で作ったのではなく、このゲーム自体を教えてもらった上杉カレー<a href="https://twitter.com/dbs_curry">@dbs_curry</a>にチェックを頼みました。<br>
			これがまた同じくゲームクリエイターなわけで、それも優れている。ゲーム作りというのはバーリ・トゥードなので突然のローカライズの直しだって出来るわけです。<br>
			彼は何の注文もなしに完璧な直しをしてくれました。<br>
			また、先んじて<a href="https://ohgoru.tistory.com/19">韓国語のローカライズをしているohgoru</a>氏に技術的な面で援助いただきました。
			特に画像の変換やツールの知識は氏の助力なしには調べてもわからないことだらけでした。
			お二人のおかげで作業は一人でやる9.9倍は加速した。<br>
			この場を借りてお礼を申し上げます。</p>
			<h3 id="dlcと今後について">DLCと今後について</h3>
			<p>1/8/2024 DLC部分まで実装しました。<br>
			最初の版の元になったのはDLC2発表直前のもので、現在は最新版です。<br>
			DLCはより文脈重視となっているので、ぜひじっくりストーリーの余白まで読むくらいの気持ちで遊んでみてほしいです。</p>
			<h3 id="適用方法">パッチ適用方法（Macは追加で色々あるので後述）</h3>
			<p>ゲームのパックファイルを差し替えます。<br>
			Windowsの方は<br>
			<a href="https://drive.google.com/file/d/1kL_8QlRxc5FGmqtRSkjQ7a5DeRQLzumq/view?usp=sharing">goldenidol_JP.Xdelta</a>  をダウンロード<br>
			Macの方は<br>
			<a href="https://drive.google.com/file/d/1nVfOK0U_1H_EwL0pJeEDRok4Q8bpu3y2/view?usp=sharing">goldenidol_JP_MAC.xdelta</a>  をダウンロード<br>

			Steamのライブラリで右クリック→管理→ローカルファイルを閲覧をクリック<br>
				<picture>
					<img src={steamlib} alt="steam" />
				</picture>

			ここからはWindowsとMacで少々違います。<br>
			<b>Windowsでは</b><br>
			そこにgame.pckがあるので<a href="https://github.com/marco-calautti/DeltaPatcher/releases/download/v3.0.1/deltapatcher_v3.0.1_win_x86.zip">xdelta patcher</a>を使ってパッチしてください。<br>
			下記はダウンロードしなくても出来るように公開してるみたいです。<br>
			https://kotcrab.github.io/xdelta-wasm/<br>
			ようは、Original Fileにgame.pckを選択、Xdelta patchにダウンロードしたgoldenidol_JP.xdeltaを選択してApplyです。<br>
			それでゲームが改造イングされます。<br>
			<b>Macでは</b><br>
			①インストールした「The Case of The Golden Idol」のappファイルを右クリック→パッケージの内容を表示<br>
			②Contents/Resources/The Case of The Golden Idol.pckを上記の日本語化pckファイルに置き換える<br>
			これはWindowsと同じで、Xdelta patcherをどうにか使ってここでダウンロードしたものに改造する必要があります。<br>
			更に、適用したあと、MacOSは証明書とかうるさいので<br>
			③上の階層に戻ってappファイルをそのままダブルクリックすると「”The Case of The Golden Idol”は壊れているため開けません。ゴミ箱に入れる必要があります。」というエラーが表示される。<br>
			この場合、ダブルクリックではなく右クリック→開く で表示されるウィンドウ内の「開く」を押すと無事に起動できます<br>
			（参考：https://child-programmer.com/m-v-app-broken-2022/）
			<br>
			どちらにしても戻すときは<br>
			Steamのライブラリで同じく右クリック→プロパティ→インストール済みファイルに「ゲームファイルの整合性を確認」とあり、これをやると元の最新版に戻ります。</p>
			<h3 id="おまけ">おまけ</h3>
			<p>お勧めするべきところを詳しく書いた<br>
			<a href="https://note.com/yupika/n/n065c9a5073b8">The Case of the Golden Idolの日本語化をしました。①</a><br>
			The Case of the Golden Idolの日本語化をしました。⓶<br>
			を書きました。今見直したら⓶はどうでもよかったのでリンクを外しました。なんだこれ？<br>
			一般の人は文字を読める量に限りがあるらしいので新聞に載るサイズくらいの文章で書いてみたんですがどうでしょう。<br>
			あ、それで思い出した。⓶はですね。ローカライズやゲーム作りについて気軽に手を出してもらえたらなと思った啓蒙思想で書いたんだ。どうでもよかったですね。</p>
			<p>では皆様にも、グリフォンのご加護がありますよう。<br>
			2023/9/16 yupika拝</p>
			
			</article>
		  </div>

  