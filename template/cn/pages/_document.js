import { Html, Head, Main, NextScript } from "next/document";
import { ScriptCordova } from 'cordova-next';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <ScriptCordova />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
