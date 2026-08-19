<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
<xsl:output method="html" encoding="UTF-8" indent="yes"/>
<xsl:template match="/">
<html>
<head>
<title>Sitemap</title>
<meta charset="UTF-8" />
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 2rem; color: #1a1a1a; }
  h1 { font-size: 1.1rem; font-weight: 600; }
  p.count { color: #666; margin-top: -0.5rem; }
  table { border-collapse: collapse; width: 100%; margin-top: 1rem; }
  th, td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e5e5; font-size: 0.85rem; vertical-align: top; }
  th { background: #f5f5f5; }
  a { color: #2563eb; text-decoration: none; word-break: break-all; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
<xsl:choose>
  <xsl:when test="sitemap:sitemapindex">
    <h1>Index des sitemaps</h1>
    <p class="count"><xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/> sous-sitemap(s)</p>
    <table>
      <tr><th>Sitemap</th><th>Dernière modification</th></tr>
      <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
        <tr>
          <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
          <td><xsl:value-of select="sitemap:lastmod"/></td>
        </tr>
      </xsl:for-each>
    </table>
  </xsl:when>
  <xsl:otherwise>
    <h1>Sitemap</h1>
    <p class="count"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URL(s)</p>
    <table>
      <tr><th>URL</th><th>Dernière modification</th><th>Fréquence</th><th>Priorité</th></tr>
      <xsl:for-each select="sitemap:urlset/sitemap:url">
        <tr>
          <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
          <td><xsl:value-of select="sitemap:lastmod"/></td>
          <td><xsl:value-of select="sitemap:changefreq"/></td>
          <td><xsl:value-of select="sitemap:priority"/></td>
        </tr>
      </xsl:for-each>
    </table>
  </xsl:otherwise>
</xsl:choose>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
