class Entry {
  constructor(
    id,
    amount,
    details,
    date,
    imagePath,
    isGave,
    isGot,
    gave,
    got,
    timestamp,
  ) {
    this.id = id;
    this.amount = amount;
    this.details = details;
    this.date = date;
    this.imagePath = imagePath;
    this.isGave = isGave;
    this.isGot = isGot;
    this.gave = gave;
    this.got = got;
    this.timestamp = timestamp;
  }
}
export default Entry;
