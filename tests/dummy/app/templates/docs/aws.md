# AWS S3 Configuration

Example configuration for AWS S3 setup for direct file uploads.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
  <CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
    <AllowedHeader>Content-Type</AllowedHeader>
    <AllowedHeader>x-amz-acl</AllowedHeader>
    <AllowedHeader>origin</AllowedHeader>
    <AllowedHeader>accept</AllowedHeader>
    <ExposeHeader>Location</ExposeHeader>
  </CORSRule>
</CORSConfiguration>
```
