# Editing the Louma Bakery website

You have a simple editor at **https://loumabakeryy.netlify.app/admin/**.
No code, no GitHub account. Log in with your email and password, change what
you need, click **Publish**. The site updates a minute or two later.

Nothing is deleted for good. Every change is saved with a history, and your
developer can undo anything. When in doubt, make the change and look at the
live site.

Want to try it first without logging in? Open **/admin-demo**. It looks and
works the same, but nothing you do there is saved.

---

## Change a price

1. Open the editor and click **Menu**, then **Menu items**.
2. Open the category, then the item.
3. Type the new price the way it should look, like `$4.50`.
4. Click **Publish**.

## Add or remove a menu item

Menu → the category → **Items**. Add Item at the bottom, or the trash icon to
remove one. Drag the handle on the left to reorder. Publish when done.

## Swap a photo

For a menu item: open the item, click **Photo**, upload the new one, Publish.
For the big site photos (hero, story, and so on): click **Images**, pick the
slot by its label, upload, Publish.

A good photo is landscape, at least 1200px wide, and under 3MB. The site
shrinks and optimizes it on its own.

## Change hours, address, phone, or links

**Site settings** → **Settings**. Hours are one row per group of days; for a
closed day put `Closed` in Opens and leave Closes empty. Paste the full Uber
Eats, PayPal, or Instagram link into its field. Publish.

## Change the words on a page

**Page text** → **All pages**. Each page is a section; open it and edit the
headline, intro, or paragraphs. A few fields are marked internal. Leave those
alone. Publish.

---

## The menu will soon come from the Google Sheet

Once the sheet is connected, the menu on the site will update itself from
your Google Sheet every day (and the Menu section of this editor becomes
read-mostly). How that gets switched on is written down in
`scripts/README.md`. Until then, edit the menu here as usual.

## Inviting another editor

An admin does this from the DecapBridge dashboard, not this editor:
DecapBridge → your site → Collaborators → invite by email.

## Quick reference

| I want to... | Go to |
|---|---|
| Change a price or item | Menu |
| Swap a menu photo | Menu → item → Photo |
| Change the hero or story photos | Images |
| Change hours or the address | Site settings |
| Change the Uber Eats link | Site settings → Links |
| Reword a page | Page text |
| Just try the editor | /admin-demo |
