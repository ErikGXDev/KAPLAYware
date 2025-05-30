import k from "../engine";

k.scene("gameover", (score: number) => {
	k.add([
		k.rect(k.width(), k.height()),
		k.color(k.BLACK),
	]);

	k.add([
		k.text("you lost :("),
		k.pos(k.center()),
		k.anchor("center"),
	]);

	k.add([
		k.text(score.toString()),
		k.pos(k.center().x, k.center().y + 30),
		k.anchor("center"),
	]);

	k.onClick(() => k.go("game"));
	k.onKeyPress("space", () => k.go("game"));
});
