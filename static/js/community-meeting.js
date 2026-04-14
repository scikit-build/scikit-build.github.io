(function () {
  function getThirdFriday(year, month) {
    const first = new Date(year, month, 1);
    const daysUntilFriday = (5 - first.getDay() + 7) % 7;
    return 1 + daysUntilFriday + 14;
  }

  const nyDateFormat = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const nyOffsetFormat = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "shortOffset",
  });

  function nyOffsetMinutes(date) {
    const offset = nyOffsetFormat
      .formatToParts(date)
      .find((p) => p.type === "timeZoneName").value;
    if (offset === "GMT") return 0;
    const match = offset.match(/^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/);
    if (!match) throw new Error("Unexpected offset: " + offset);
    const sign = match[1] === "+" ? 1 : -1;
    return sign * (Number(match[2]) * 60 + Number(match[3] || 0));
  }

  function newYorkTimeToDate(year, month, day, hour, minute) {
    const localAsUTC = Date.UTC(year, month, day, hour, minute, 0);
    return new Date(localAsUTC - nyOffsetMinutes(new Date(localAsUTC)) * 60_000);
  }

  function nextThirdFridayET(hour, minute) {
    const now = new Date();
    const parts = Object.fromEntries(
      nyDateFormat
        .formatToParts(now)
        .filter((p) => p.type !== "literal")
        .map((p) => [p.type, p.value])
    );
    let year = Number(parts.year);
    let month = Number(parts.month) - 1;

    function buildMeeting(y, m) {
      return newYorkTimeToDate(y, m, getThirdFriday(y, m), hour, minute);
    }

    let meeting = buildMeeting(year, month);
    if (meeting <= now) {
      month += 1;
      if (month === 12) {
        month = 0;
        year += 1;
      }
      meeting = buildMeeting(year, month);
    }
    return meeting;
  }

  const els = document.querySelectorAll(".meeting-next");
  if (els.length > 0) {
    const text = nextThirdFridayET(12, 0).toLocaleString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
    els.forEach((el) => { el.textContent = text; });
  }
})();
