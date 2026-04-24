import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface PageMetadata {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

export function setPageMetadata(metadata: PageMetadata) {
  // Set title
  document.title = metadata.title;

  // Update or create meta tags
  const updateMeta = (name: string, content: string) => {
    let element = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
    if (!element) {
      element = document.createElement("meta");
      if (name.startsWith("og:")) {
        element.setAttribute("property", name);
      } else {
        element.setAttribute("name", name);
      }
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
  };

  updateMeta("description", metadata.description);
  updateMeta("og:title", metadata.title);
  updateMeta("og:description", metadata.description);
  
  if (metadata.image) {
    updateMeta("og:image", metadata.image);
  }
  
  if (metadata.url) {
    updateMeta("og:url", metadata.url);
  }
  
  if (metadata.type) {
    updateMeta("og:type", metadata.type);
  }
}
