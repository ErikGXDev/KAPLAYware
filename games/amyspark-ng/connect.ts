import { assets } from "@kaplayjs/crew";
import kaplay, { Color, GameObj, Vec2 } from "kaplay";
import mulfokColors from "../../src/plugins/colors.ts";
import { Minigame } from "../../src/types.ts";

const newGame: Minigame = {
	prompt: "connect",
	author: "amyspark-ng",
	input: { cursor: { hide: false } },
	rgb: mulfokColors.DARK_PURPLE,
	duration: (ctx) => ctx.difficulty == 3 ? 7 : 5,
	urlPrefix: "games/amyspark-ng/assets",
	load(ctx) {
		ctx.loadSprite("plug", "/sprites/connect/plug.png");
		ctx.loadSprite("box", "/sprites/connect/box.png");
		ctx.loadSound("plug", "/sounds/plug.ogg");
	},
	start(ctx) {
		const game = ctx.make();

		const allColors = [
			ctx.Color.fromHex("#cc425e"),
			ctx.Color.fromHex("#6bc96c"),
			ctx.Color.fromHex("#8db7ff"),
			ctx.Color.fromHex("#ffb879"),
			ctx.Color.fromHex("#ee8fcb"),
		];

		const COLOR_AMOUNT = ctx.difficulty == 1 ? 2 : ctx.difficulty == 2 ? 3 : ctx.difficulty == 3 ? 4 : 0;

		const gameColors = ctx.chooseMultiple(allColors, COLOR_AMOUNT);

		const sockets: GameObj[] = [];
		const sources: GameObj[] = [];
		const plugSocketState: ("wiring" | "connected" | "disconnected")[] = [];
		const winCondition = () => !plugSocketState.some((state) => state != "connected");

		gameColors.forEach((color, plugIndex, arr) => {
			plugSocketState[plugIndex] = "disconnected";

			const socketObj = game.add([
				ctx.sprite("box"),
				ctx.color(color),
				ctx.pos(ctx.center().x, ctx.center().y - 200),
				ctx.area(),
				ctx.z(1),
				"socket",
				"ignorepoint",
			]);

			const sourceObj = game.add([
				ctx.sprite("box"),
				ctx.color(color),
				ctx.pos(ctx.center().x, ctx.center().y + 200),
				"plugbox",
			]);

			const plugObj = sourceObj.add([
				ctx.sprite("plug"),
				ctx.area(),
				ctx.color(color),
				ctx.pos(sourceObj.width / 2, -30),
				ctx.anchor("center"),
				ctx.z(socketObj.z - 1),
			]);

			sources[plugIndex] = sourceObj;
			sockets[plugIndex] = socketObj;

			let socketGap = (ctx.width() - socketObj.width * sockets.length) / (sockets.length + 1);
			let socketX = socketGap;
			sockets.forEach((socket) => {
				socket.pos.x = socketX;
				socketX += socketGap + socket.width;
			});

			sources.sort(() => Math.random() - 0.5); // shuffles them
			let sourceGap = (ctx.width() - sourceObj.width * sources.length) / (sources.length + 1);
			let sourceX = sourceGap;
			sources.forEach((source, index) => {
				source.pos.x = sourceX;
				sourceX += sourceGap + source.width;
			});

			plugObj.onUpdate(() => {
				if (plugSocketState[plugIndex] == "wiring") {
					plugObj.pos = ctx.lerp(plugObj.pos, sourceObj.fromWorld(ctx.mousePos()), 0.5);
				}
				else if (plugSocketState[plugIndex] == "connected") {
					const socketBoxPos = ctx.vec2(socketObj.pos.x + socketObj.width / 2, socketObj.pos.y + plugObj.height - 10);
					const transformedPoint = sourceObj.fromWorld(socketBoxPos);
					plugObj.pos = ctx.lerp(plugObj.pos, transformedPoint, 0.5);
				}
				else if (plugSocketState[plugIndex] == "disconnected") {
					plugObj.pos = ctx.lerp(plugObj.pos, ctx.vec2(sourceObj.width / 2, -30), 0.5);
				}
			});

			plugObj.onClick(() => {
				if (plugSocketState[plugIndex] == "disconnected") plugSocketState[plugIndex] = "wiring";
			});

			plugObj.onUpdate(() => {
				if (socketObj.isHovering() && plugSocketState[plugIndex] != "connected" && plugSocketState[plugIndex] == "wiring") {
					ctx.play("plug", { detune: ctx.rand(-30, 30) * plugIndex });
					plugSocketState[plugIndex] = "connected";
				}

				if (ctx.isMouseReleased("left") && plugSocketState[plugIndex] == "wiring") {
					if (!socketObj.isHovering()) plugSocketState[plugIndex] = "disconnected";
				}
			});

			game.onDraw(() => {
				ctx.drawLine({
					p1: ctx.vec2(sourceObj.pos.x + sourceObj.width / 2, sourceObj.pos.y),
					p2: sourceObj.toWorld(plugObj.pos),
					width: 10,
					color,
				});
			});
		});

		let hasWon = false;
		game.onUpdate(() => {
			if (winCondition() && !hasWon) {
				hasWon = true;
				ctx.win();
				ctx.wait(1, () => ctx.finish());
			}
		});

		game.onDraw(() => {
			// draw the connected ones
			gameColors.forEach((color, index) => {
				if (plugSocketState[index] == "disconnected") return;
			});
		});

		ctx.onTimeout(() => {
			if (!winCondition()) {
				ctx.lose();
				ctx.wait(1, () => {
					ctx.finish();
				});
			}
		});

		return game;
	},
};

export default newGame;
