# iMBrace backend demos

Small websites that use iMBrace as their backend: a product catalogue and a service desk. They are hosted on Netlify at https://imbrace-demos.netlify.app/.

- `site/`: the pages. Visitors choose from fixed options and press Send.
- `netlify/functions/`: small server functions. Each hands the visitor's choice to an iMBrace workflow (the workflow addresses and a shared key are Netlify environment variables, never in this repo) and passes back only its answer.
- The root `index.html`, `catalogue/` and `support/` redirect the old GitHub Pages addresses to Netlify.

An Ingram Micro Singapore demo. Orvik and Harbourline are fictional.
