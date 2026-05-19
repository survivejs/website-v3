import { urlJoin as urlJoinFn } from "./utilities/urlJoin.ts";

function init() {
  function getDate(d: string) {
    const date = new Date(d);

    return `${date.getDate()}.${date.getMonth() + 1}`;
  }

  function getYear(d: string) {
    return new Date(d).getFullYear();
  }

  function getDatetime(d: string) {
    const date = new Date(d);

    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  function getFullDate(d: string) {
    const date = new Date(d);

    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  }

  function dateToString(date: string) {
    try {
      return (new Date(date)).toISOString().split("T")[0];
    } catch (error) {
      console.error("Failed to parse", date);
      throw new Error(error);
    }
  }

  function length(arr: unknown[]) {
    return arr.length;
  }

  function urlJoin(...parts: string[]) {
    if (!parts.every((s) => typeof s === "string")) {
      console.error(parts);
      throw new Error("Failed to join url");
    }

    return urlJoinFn(...parts);
  }

  function tw(className: string) {
    return className;
  }

  // Add your global page utilities here.
  // Alternatively they can be defined per component.
  return {
    dateToString,
    getDate,
    getYear,
    getDatetime,
    getFullDate,
    length,
    tw,
    urlJoin,
  };
}

export { init };
