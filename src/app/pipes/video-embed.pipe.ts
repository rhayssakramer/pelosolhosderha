import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'videoEmbed',
  standalone: true
})
export class VideoEmbedPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(content: string): SafeHtml {
    if (!content) return content as SafeHtml;

    let html = content;

    // YouTube URLs in links - extract and convert to iframe
    html = html.replace(
      /<a[^>]*href=["']?(https:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=|shorts\/)([a-zA-Z0-9_-]+)|youtu\.be\/([a-zA-Z0-9_-]+))["']?[^>]*>.*?<\/a>/g,
      (match, url, id1, id2) => {
        const videoId = id1 || id2;
        return `<iframe class="video-embed" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      }
    );

    // Vimeo URLs in links
    html = html.replace(
      /<a[^>]*href=["']?(https:\/\/vimeo\.com\/(\d+))["']?[^>]*>.*?<\/a>/g,
      (match, url, videoId) => {
        return `<iframe class="video-embed" src="https://player.vimeo.com/video/${videoId}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
      }
    );

    // Instagram URLs in links
    html = html.replace(
      /<a[^>]*href=["']?(https:\/\/www\.instagram\.com\/reel\/([a-zA-Z0-9_-]+)\/)["']?[^>]*>.*?<\/a>/g,
      (match, url, reelId) => {
        return `<iframe class="video-embed" src="https://www.instagram.com/reel/${reelId}/embed/" frameborder="0"></iframe>`;
      }
    );

    // YouTube URLs as plain text (not in links)
    html = html.replace(
      /(?<!<a[^>]*href=")https:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)(?!")/g,
      (match, videoId) => `<iframe class="video-embed" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    );

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
