# Ghostbe Studio

Static landing page for Ghostbe Studio, ready for GitHub Pages.

https://solpadoin.github.io/ghostbe-studio/#home

## Content config

Editable copy, links, services, and projects live in:

```text
config/config.txt
```

The site loads that file in the browser and renders repeated `SERVICE_N_*` and `PROJECT_N_*` blocks dynamically. The HTML includes fallback content, so the page still has meaningful content if the config request is unavailable.
