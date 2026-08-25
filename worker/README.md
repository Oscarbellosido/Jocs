# jocs-records

Worker de Cloudflare amb la taula de records compartida dels jocs.

- Codi: `records.js` (es el que hi ha desplegat)
- Configuracio: `wrangler.jsonc`
- Espai KV: `jocs-records-kv` (`fa810f2cccb8468699052fcb1aa00755`), lligat
  amb el nom `RECORDS`
- Adreca: https://jocs-records.oscarbellosido.workers.dev

Es va desplegar enganxant el codi al tauler de Cloudflare. Aquesta copia
hi es perque no es perdi i per poder-la modificar amb control de versions.

## Provar-lo

    node scripts/prova-worker.mjs

Simula el KV i comprova ordenacio, retall als 10 millors, validacions i CORS.
