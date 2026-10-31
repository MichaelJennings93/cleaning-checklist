/* Optional visit photos, shared by both phones. Files stay on the server; no stock counts. */
const CupboardPhotos = (() => {
  const labelDate = date => CleanCore.fromKey(date)?.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) || "this visit";
  const el = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  class Gallery {
    constructor(root, client, remove) { this.root = root; this.client = client; this.remove = remove; this.version = 0; this.urls = []; this.signature = null; }
    async render(photos) {
      const signature = JSON.stringify(photos);
      if (this.signature === signature) return;
      this.signature = signature;
      const version = ++this.version;
      this.urls.forEach(URL.revokeObjectURL); this.urls = [];
      this.root.replaceChildren(); this.root.classList.add("cupboard-gallery");
      for (const [index, photo] of photos.entries()) {
        const figure = el("figure"), open = el("button", "Loading photo…", "cupboard-thumb");
        open.type = "button"; open.disabled = true;
        open.setAttribute("aria-label", "View cupboard photo " + (index + 1) + " from " + labelDate(photo.date));
        figure.append(open, el("figcaption", labelDate(photo.date)));
        if (this.remove) {
          const remove = el("button", "Remove", "cupboard-remove"); remove.type = "button";
          remove.setAttribute("aria-label", "Remove photo " + (index + 1) + " from this visit");
          remove.onclick = () => this.remove(photo, remove); figure.append(remove);
        }
        this.root.append(figure);
        const load = async () => {
          open.disabled = true; open.textContent = "Loading photo…";
          try {
            const response = await this.client.fileRequest("/api/cupboard-photos/" + photo.id + "/image");
            const blob = await response.blob();
            if (version !== this.version) return;
            const url = URL.createObjectURL(blob); this.urls.push(url);
            const img = el("img"); img.alt = "Supply cupboard · " + labelDate(photo.date); img.src = url;
            open.replaceChildren(img); open.disabled = false;
            open.onclick = () => {
              const dialog = el("dialog", "", "cupboard-lightbox"), close = el("button", "Close photo", "button save-only"), full = img.cloneNode();
              close.onclick = () => dialog.close(); dialog.append(close, full); document.body.append(dialog);
              dialog.setAttribute("aria-label", img.alt);
              dialog.addEventListener("close", () => dialog.remove(), { once: true }); dialog.showModal();
            };
          } catch {
            if (version !== this.version) return;
            open.textContent = "Tap to retry photo"; open.disabled = false; open.onclick = load;
          }
        };
        load();
      }
    }
  }
  async function prepare(file) {
    if (file.size > 25 * 1024 * 1024) throw new Error("Choose a photo smaller than 25 MB.");
    const url = URL.createObjectURL(file), img = new Image();
    try {
      img.src = url;
      await img.decode();
      const scale = Math.min(1, 1800 / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const context = canvas.getContext("2d");
      context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Canvas exports oriented pixels without the original location metadata.
      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", .82));
      if (!blob || blob.size > 3 * 1024 * 1024) throw new Error("Please choose a smaller photo.");
      return blob;
    } catch (error) {
      throw new Error(error.message?.includes("smaller") ? error.message : "Couldn’t read this photo. Take a new photo or choose a JPEG or PNG.");
    } finally { URL.revokeObjectURL(url); }
  }
  class Visit {
    constructor(root, client) {
      this.root = root; this.client = client; this.date = ""; this.photos = []; this.pending = []; this.locked = false;
      this.status = root.querySelector(".cupboard-status"); this.queue = root.querySelector(".cupboard-queue");
      this.gallery = new Gallery(root.querySelector(".cupboard-gallery"), client, (p, b) => this.remove(p, b));
      root.querySelectorAll("[data-photo-input]").forEach(button => {
        button.onclick = () => { if (!this.locked) document.getElementById(button.dataset.photoInput).click(); };
      });
      root.querySelectorAll('input[type="file"]').forEach(input => input.addEventListener("change", () => { this.add([...input.files]); input.value = ""; }));
      root.querySelector(".cupboard-refresh").onclick = () => this.refresh();
      setInterval(() => { if (!document.hidden && this.date) this.refresh(); }, 5000);
      window.addEventListener("online", () => this.refresh());
      window.addEventListener("beforeunload", e => { if (this.hasPending()) { e.preventDefault(); e.returnValue = ""; } });
    }
    hasPending() { return this.pending.length > 0 || !!this.removing; }
    setLocked(value) { this.locked = value; this.root.querySelectorAll("button").forEach(b => { if (!b.classList.contains("cupboard-thumb")) b.disabled = value; }); }
    setDate(date) {
      if (this.date === date) return;
      this.date = date; this.photos = []; this.gallery.render([]);
      this.root.querySelector(".cupboard-date").textContent = "For " + labelDate(date) + " · optional";
      this.status.textContent = "Loading this visit’s photos…"; this.refresh();
    }
    async refresh() {
      const date = this.date; if (!date || this.loading === date) return;
      this.loading = date;
      try {
        const result = await this.client.request("/api/cupboard-photos?date=" + date);
        if (this.date !== date) return;
        this.photos = result.photos; this.gallery.render(this.photos);
        this.status.textContent = this.photos.length ? this.photos.length + "/6 photos saved for this visit · shared with both phones" : "No photos yet. A quick cupboard photo is all you need.";
        this.root.querySelector(".cupboard-refresh").hidden = true;
      } catch {
        if (this.date !== date) return;
        this.status.textContent = "Couldn’t refresh the photos. Check your connection and try again.";
        this.root.querySelector(".cupboard-refresh").hidden = false;
      } finally { if (this.loading === date) this.loading = null; }
    }
    async add(files) {
      if (this.locked || !files.length) return;
      if (files.length + this.photos.length + this.pending.length > 6) { this.status.textContent = "You can add up to six photos per visit. Please select fewer photos."; return; }
      const entries = files.map(file => ({ id: crypto.randomUUID(), date: this.date, file, busy: false, error: "" }));
      this.pending.push(...entries); this.renderQueue();
      for (const entry of entries) await this.upload(entry);
    }
    async upload(entry) {
      if (entry.busy || !this.pending.includes(entry)) return;
      entry.busy = true; entry.error = ""; this.renderQueue();
      try {
        entry.blob ||= await prepare(entry.file);
        await this.client.fileRequest("/api/cupboard-photos?date=" + entry.date + "&id=" + entry.id, entry.blob);
        this.pending = this.pending.filter(p => p !== entry);
        await this.refresh();
      } catch (error) { entry.error = error.message || "Upload didn’t finish. Please retry."; }
      finally { entry.busy = false; this.renderQueue(); }
    }
    renderQueue() {
      this.queue.replaceChildren();
      for (const entry of this.pending) {
        const row = el("div", "", "cupboard-upload"), text = el("span", entry.error || (entry.busy ? "Uploading photo… Keep this page open." : "Photo waiting to upload…"));
        row.append(text);
        if (entry.error) {
          const retry = el("button", "Retry", "media-button"), discard = el("button", "Discard", "media-button");
          retry.onclick = () => this.upload(entry);
          discard.onclick = () => { this.pending = this.pending.filter(p => p !== entry); this.renderQueue(); };
          row.append(retry, discard);
        }
        this.queue.append(row);
      }
    }
    async remove(photo, button) {
      if (this.locked || this.removing) return;
      this.removing = true; button.disabled = true;
      try {
        await this.client.request("/api/cupboard-photos/" + photo.id + "/remove", {});
        await this.refresh();
      } catch (error) { this.status.textContent = error.message; button.disabled = false; }
      finally { this.removing = false; }
    }
  }
  async function latest(root, client) {
    const status = root.querySelector(".cupboard-status"), gallery = new Gallery(root.querySelector(".cupboard-gallery"), client), retry = root.querySelector(".cupboard-refresh");
    let loading = false;
    const refresh = async () => {
      if (loading) return; loading = true;
      try {
        const result = await client.request("/api/cupboard-photos/latest");
        status.textContent = result.photos.length ? "From the visit on " + labelDate(result.date) : "No cupboard photos yet. Add one when you finish a visit.";
        gallery.render(result.photos); retry.hidden = true;
      } catch { status.textContent = "Couldn’t load the cupboard photos."; retry.hidden = false; }
      finally { loading = false; }
    };
    retry.onclick = refresh; refresh();
    setInterval(() => { if (!document.hidden) refresh(); }, 5000);
  }
  return { Visit, Gallery, latest };
})();
