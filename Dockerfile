# ==================================================
# Nocthera v1.1.0 - Railway Production Image
# ==================================================

FROM node:24-bookworm-slim

LABEL name="Nocthera"
LABEL version="1.1.0"

WORKDIR /app

# Discord voice playback needs FFmpeg at runtime.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install --omit=dev \
    && npm cache clean --force

COPY . .

RUN mkdir -p logs cache backups temp

ENV NODE_ENV=production
ENV FFMPEG_PATH=/usr/bin/ffmpeg

CMD ["npm", "start"]
