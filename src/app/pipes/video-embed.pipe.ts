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

    // Replace video markers with iframes
    // Remove optional whitespace around markers to avoid extra spacing
    
    // [VIDEO:youtube:VIDEO_ID] -> YouTube iframe (11 char ID)
    html = html.replace(
      /\s*\[VIDEO:youtube:([a-zA-Z0-9_-]{11})\]\s*/g,
      '<div class="video-wrapper"><iframe class="video-embed" src="https://www.youtube.com/embed/$1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
    );

    // [VIDEO:vimeo:VIDEO_ID] -> Vimeo iframe
    html = html.replace(
      /\s*\[VIDEO:vimeo:(\d+)\]\s*/g,
      '<div class="video-wrapper"><iframe class="video-embed" src="https://player.vimeo.com/video/$1" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div>'
    );

    // [VIDEO:instagram:REEL_ID] -> Instagram iframe
    html = html.replace(
      /\s*\[VIDEO:instagram:([a-zA-Z0-9_-]+)\]\s*/g,
      '<div class="video-wrapper"><iframe class="video-embed" src="https://www.instagram.com/reel/$1/embed/" frameborder="0"></iframe></div>'
    );

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
