/* Server-confirmed shared repairs. Revisions keep delayed responses from hiding newer changes. */
class RepairsClient {
  constructor({ request, onChange = () => {} }) { this.request = request; this.onChange = onChange; this.records = new Map(); }
  merge(issues) {
    let changed = !this.initialized;
    for (const issue of issues) if (issue && (!this.records.has(issue.id) || this.records.get(issue.id).revision < issue.revision)) { this.records.set(issue.id, issue); changed = true; }
    this.initialized = true;
    if (changed) this.onChange([...this.records.values()]);
  }
  async refresh() {
    if (this.refreshing) return this.refreshing;
    this.refreshing = this.request("/api/issues").then(data => this.merge(data.issues)).finally(() => { this.refreshing = null; });
    return this.refreshing;
  }
  async save(id, fields, revision) {
    try {
      const result = await this.request(revision ? "/api/issues/" + encodeURIComponent(id) : "/api/issues", revision ? { revision, changes: fields } : { id, fields });
      this.merge([result.issue]); return result.issue;
    } catch (error) { if (error.result?.issue) this.merge([error.result.issue]); throw error; }
  }
}
if (typeof module !== "undefined") module.exports = RepairsClient;
