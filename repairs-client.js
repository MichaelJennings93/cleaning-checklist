/* Server-confirmed shared repairs. Revisions keep delayed responses from hiding newer changes. */
class RepairsClient {
  constructor({ request, onChange = () => {}, endpoint = "/api/issues", listKey = "issues", itemKey = "issue" }) { Object.assign(this, { request, onChange, endpoint, listKey, itemKey }); this.records = new Map(); }
  merge(issues) {
    let changed = !this.initialized;
    for (const issue of issues) if (issue && (!this.records.has(issue.id) || this.records.get(issue.id).revision < issue.revision)) { this.records.set(issue.id, issue); changed = true; }
    this.initialized = true;
    if (changed) this.onChange([...this.records.values()]);
  }
  async refresh() {
    if (this.refreshing) return this.refreshing;
    this.refreshing = this.request(this.endpoint).then(data => this.merge(data[this.listKey])).finally(() => { this.refreshing = null; });
    return this.refreshing;
  }
  async save(id, fields, revision) {
    try {
      const result = await this.request(revision ? this.endpoint + "/" + encodeURIComponent(id) : this.endpoint, revision ? { revision, changes: fields } : { id, fields });
      this.merge([result[this.itemKey]]); return result[this.itemKey];
    } catch (error) { if (error.result?.[this.itemKey]) this.merge([error.result[this.itemKey]]); throw error; }
  }
}
if (typeof module !== "undefined") module.exports = RepairsClient;
