import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

@Pipe({
  name: 'videoEmbed',
  standalone: true
})
export class VideoEmbedPipe implements PipeTransform {
  private platformId = inject(PLATFORM_ID);

  constructor(private sanitizer: DomSanitizer) {}

  transform(content: string): SafeHtml {
    if (!content) return content as SafeHtml;

    // Only process on browser side
    if (!isPlatformBrowser(this.platformId)) {
      return this.sanitizer.bypassSecurityTrustHtml(content);
    }

    let html = content;
    console.log('🔍 [VideoEmbedPipe] Conteúdo recebido:', html);

    // Replace video markers with iframes
    // Remove optional whitespace around markers to avoid extra spacing
    
    // [VIDEO:youtube:VIDEO_ID] -> YouTube iframe (11 char ID)
    const youtubeMatches = html.match(/\s*\[VIDEO:youtube:([a-zA-Z0-9_-]+)\]\s*/g);
    if (youtubeMatches) {
      console.log('🎬 [VideoEmbedPipe] Marcadores YouTube encontrados:', youtubeMatches);
      youtubeMatches.forEach(match => {
        const idMatch = match.match(/\[VIDEO:youtube:([a-zA-Z0-9_-]+)\]/);
        if (idMatch) {
          console.log('  ID:', idMatch[1], '| Tamanho:', idMatch[1].length);
        }
      });
    }
    
    html = html.replace(
      /\s*\[VIDEO:youtube:([a-zA-Z0-9_-]+)\]\s*/g,
      (match, videoId) => {
        console.log('✅ Convertendo marcador YouTube - ID:', videoId, 'Tamanho:', videoId.length);
        return `<div class="video-wrapper"><iframe class="video-embed" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      }
    );

    // [VIDEO:vimeo:VIDEO_ID] -> Vimeo iframe
    html = html.replace(
      /\s*\[VIDEO:vimeo:(\d+)\]\s*/g,
      (match, videoId) => {
        console.log('✅ Convertendo marcador Vimeo - ID:', videoId);
        return `<div class="video-wrapper"><iframe class="video-embed" src="https://player.vimeo.com/video/${videoId}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div>`;
      }
    );

    // [VIDEO:instagram:REEL_ID] -> Instagram iframe
    html = html.replace(
      /\s*\[VIDEO:instagram:([a-zA-Z0-9_-]+)\]\s*/g,
      (match, videoId) => {
        console.log('✅ Convertendo marcador Instagram - ID:', videoId);
        return `<div class="video-wrapper"><iframe class="video-embed" src="https://www.instagram.com/reel/${videoId}/embed/" frameborder="0"></iframe></div>`;
      }
    );

    // Remove <p> tags around video-wrapper divs (invalid HTML: div inside p)
    html = html.replace(/<p>\s*<div class="video-wrapper">/g, '<div class="video-wrapper">');
    html = html.replace(/<\/div>\s*<\/p>/g, '</div>');
    
    console.log('📤 [VideoEmbedPipe] Conteúdo transformado:', html);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
