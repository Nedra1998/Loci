import { format } from "util";
import * as chalk from "chalk";
import * as _ from "lodash";
import * as figures from "figures";

enum MsgType {
  Await,
  Complete,
  Debug,
  Error,
  Fatal,
  Fav,
  Info,
  Note,
  Pause,
  Pending,
  Star,
  Start,
  Success,
  Undefined,
  Wait,
  Warn,
  Watch,
}

export interface Msg {
  type: MsgType;
  message: string;
  args: any[];
}
interface MsgTypeData {
  badge: string;
  color: Function;
  label: string;
}

let _types = new Map<MsgType, MsgTypeData>();
_types.set(MsgType.Error, {
  badge: figures.cross,
  color: chalk.red,
  label: "error",
});
_types.set(MsgType.Fatal, {
  badge: figures.cross,
  color: chalk.red,
  label: "fatal",
});
_types.set(MsgType.Fav, {
  badge: figures.heart,
  color: chalk.magenta,
  label: "favorite",
});
_types.set(MsgType.Info, {
  badge: figures.info,
  color: chalk.blue,
  label: "info",
});
_types.set(MsgType.Star, {
  badge: figures.star,
  color: chalk.yellow,
  label: "star",
});
_types.set(MsgType.Success, {
  badge: figures.tick,
  color: chalk.green,
  label: "success",
});
_types.set(MsgType.Wait, {
  badge: figures.ellipsis,
  color: chalk.blue,
  label: "waiting",
});
_types.set(MsgType.Warn, {
  badge: figures.warning,
  color: chalk.yellow,
  label: "warning",
});
_types.set(MsgType.Complete, {
  badge: figures.checkboxOn,
  color: chalk.cyan,
  label: "complete",
});
_types.set(MsgType.Pending, {
  badge: figures.checkboxOff,
  color: chalk.magenta,
  label: "pending",
});
_types.set(MsgType.Note, {
  badge: figures.bullet,
  color: chalk.blue,
  label: "note",
});
_types.set(MsgType.Start, {
  badge: figures.play,
  color: chalk.yellow,
  label: "start",
});
_types.set(MsgType.Pause, {
  badge: figures.squareSmallFilled,
  color: chalk.yellow,
  label: "pause",
});
_types.set(MsgType.Debug, {
  badge: figures.nodejs,
  color: chalk.red,
  label: "debug",
});
_types.set(MsgType.Await, {
  badge: figures.ellipsis,
  color: chalk.blue,
  label: "awaiting",
});
_types.set(MsgType.Watch, {
  badge: figures.ellipsis,
  color: chalk.yellow,
  label: "watching",
});

let _longestLabel: number = (
  _.maxBy([..._types.values()], (o: MsgTypeData) => o.label.length) || {
    badge: "",
    color: chalk.white,
    label: "",
  }
).label.length;

function toPascalCase(s: string) {
  return s.replace(/\w+/g, function (w) {
    return w[0].toUpperCase() + w.slice(1).toLowerCase();
  });
}
function formatter(msg: Msg) {
  const typeData = _types.get(msg.type) || {
    badge: figures.warning,
    color: chalk.red,
    label: "WARNING",
  };
  return (
    typeData.color(_.padEnd(typeData.badge, typeData.badge.length + 1)) +
    typeData.color(chalk.underline(toPascalCase(typeData.label))) +
    " ".repeat(_longestLabel + 2 - typeData.label.length) +
    (msg.args.length !== 0
      ? format(msg.message, msg.args)
      : format(msg.message))
  );
}

function logger(msg: Msg) {
  console.log(formatter(msg));
}
export function fatal(msg: string, ...msgObjs: any[]) {
  return { type: MsgType.Fatal, message: msg, args: msgObjs };
}
export function error(msg: string, ...msgObjs: any[]) {
  return { type: MsgType.Error, message: msg, args: msgObjs };
}
export function fav(msg: string, ...msgObjs: any[]) {
  return { type: MsgType.Fav, message: msg, args: msgObjs };
}
export function info(msg: string, ...msgObjs: any[]) {
  return { type: MsgType.Info, message: msg, args: msgObjs };
}
export function success(msg: string, ...msgObjs: any[]) {
  return { type: MsgType.Success, message: msg, args: msgObjs };
}
export function wait(msg: string, ...msgObjs: any[]) {
  return { type: MsgType.Wait, message: msg, args: msgObjs };
}
export function warn(msg: string, ...msgObjs: any[]) {
  return { type: MsgType.Warn, message: msg, args: msgObjs };
}
export function complete(msg: string, ...msgObjs: any[]) {
  return { type: MsgType.Complete, message: msg, args: msgObjs };
}
export function pending(msg: string, ...msgObjs: any[]) {
  return { type: MsgType.Pending, message: msg, args: msgObjs };
}
export function note(msg: string, ...msgObjs: any[]) {
  return { type: MsgType.Note, message: msg, args: msgObjs };
}
export function start(msg: string, ...msgObjs: any[]) {
  return { type: MsgType.Start, message: msg, args: msgObjs };
}
export function pause(msg: string, ...msgObjs: any[]) {
  return { type: MsgType.Pause, message: msg, args: msgObjs };
}
export function debug(msg: string, ...msgObjs: any[]) {
  return { type: MsgType.Debug, message: msg, args: msgObjs };
}
export function await(msg: string, ...msgObjs: any[]) {
  return { type: MsgType.Await, message: msg, args: msgObjs };
}
export function watch(msg: string, ...msgObjs: any[]) {
  return { type: MsgType.Watch, message: msg, args: msgObjs };
}

export function msgLog(msg: string, ...msgObjs: any[]) {
  msgObjs.length !== 0 ? console.log(msg, msgObjs) : console.log(msg);
}
export function fatalLog(msg: string, ...msgObjs: any[]) {
  return logger({ type: MsgType.Fatal, message: msg, args: msgObjs });
}
export function errorLog(msg: string, ...msgObjs: any[]) {
  return logger({ type: MsgType.Error, message: msg, args: msgObjs });
}
export function favLog(msg: string, ...msgObjs: any[]) {
  return logger({ type: MsgType.Fav, message: msg, args: msgObjs });
}
export function infoLog(msg: string, ...msgObjs: any[]) {
  return logger({ type: MsgType.Info, message: msg, args: msgObjs });
}
export function successLog(msg: string, ...msgObjs: any[]) {
  return logger({ type: MsgType.Success, message: msg, args: msgObjs });
}
export function waitLog(msg: string, ...msgObjs: any[]) {
  return logger({ type: MsgType.Wait, message: msg, args: msgObjs });
}
export function warnLog(msg: string, ...msgObjs: any[]) {
  return logger({ type: MsgType.Warn, message: msg, args: msgObjs });
}
export function completeLog(msg: string, ...msgObjs: any[]) {
  return logger({ type: MsgType.Complete, message: msg, args: msgObjs });
}
export function pendingLog(msg: string, ...msgObjs: any[]) {
  return logger({ type: MsgType.Pending, message: msg, args: msgObjs });
}
export function noteLog(msg: string, ...msgObjs: any[]) {
  return logger({ type: MsgType.Note, message: msg, args: msgObjs });
}
export function startLog(msg: string, ...msgObjs: any[]) {
  return logger({ type: MsgType.Start, message: msg, args: msgObjs });
}
export function pauseLog(msg: string, ...msgObjs: any[]) {
  return logger({ type: MsgType.Pause, message: msg, args: msgObjs });
}
export function debugLog(msg: string, ...msgObjs: any[]) {
  return logger({ type: MsgType.Debug, message: msg, args: msgObjs });
}
export function awaitLog(msg: string, ...msgObjs: any[]) {
  return logger({ type: MsgType.Await, message: msg, args: msgObjs });
}
export function watchLog(msg: string, ...msgObjs: any[]) {
  return logger({ type: MsgType.Watch, message: msg, args: msgObjs });
}

export function fatalFmt(msg: string, ...msgObjs: any[]) {
  return formatter({ type: MsgType.Fatal, message: msg, args: msgObjs });
}
export function errorFmt(msg: string, ...msgObjs: any[]) {
  return formatter({ type: MsgType.Error, message: msg, args: msgObjs });
}
export function favFmt(msg: string, ...msgObjs: any[]) {
  return formatter({ type: MsgType.Fav, message: msg, args: msgObjs });
}
export function infoFmt(msg: string, ...msgObjs: any[]) {
  return formatter({ type: MsgType.Info, message: msg, args: msgObjs });
}
export function successFmt(msg: string, ...msgObjs: any[]) {
  return formatter({ type: MsgType.Success, message: msg, args: msgObjs });
}
export function waitFmt(msg: string, ...msgObjs: any[]) {
  return formatter({ type: MsgType.Wait, message: msg, args: msgObjs });
}
export function warnFmt(msg: string, ...msgObjs: any[]) {
  return formatter({ type: MsgType.Warn, message: msg, args: msgObjs });
}
export function completeFmt(msg: string, ...msgObjs: any[]) {
  return formatter({ type: MsgType.Complete, message: msg, args: msgObjs });
}
export function pendingFmt(msg: string, ...msgObjs: any[]) {
  return formatter({ type: MsgType.Pending, message: msg, args: msgObjs });
}
export function noteFmt(msg: string, ...msgObjs: any[]) {
  return formatter({ type: MsgType.Note, message: msg, args: msgObjs });
}
export function startFmt(msg: string, ...msgObjs: any[]) {
  return formatter({ type: MsgType.Start, message: msg, args: msgObjs });
}
export function pauseFmt(msg: string, ...msgObjs: any[]) {
  return formatter({ type: MsgType.Pause, message: msg, args: msgObjs });
}
export function debugFmt(msg: string, ...msgObjs: any[]) {
  return formatter({ type: MsgType.Debug, message: msg, args: msgObjs });
}
export function awaitFmt(msg: string, ...msgObjs: any[]) {
  return formatter({ type: MsgType.Await, message: msg, args: msgObjs });
}
export function watchFmt(msg: string, ...msgObjs: any[]) {
  return formatter({ type: MsgType.Watch, message: msg, args: msgObjs });
}

export function handleMsgs(msgs: Msg[]) {
  msgs.forEach((msg: Msg) => {
    logger(msg);
  });
}
