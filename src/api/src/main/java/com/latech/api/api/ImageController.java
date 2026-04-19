package com.latech.api.api;

import com.latech.api.business.DocumentImageService;
import com.latech.api.business.ImageService;
import com.latech.api.model.api.DocumentImageDto;
import com.latech.api.model.api.DocumentImageUpdateRequestDto;
import com.latech.api.model.db.DocumentImage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("api/document/{docId}/images")
public class ImageController {
    private final ImageService imageService;
    private final DocumentImageService documentImageService;

    public ImageController(ImageService imageService, DocumentImageService documentImageService) {
        this.imageService = imageService;
        this.documentImageService = documentImageService;
    }

    @PostMapping(value = "upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadImage(
            @PathVariable String docId,
            @RequestParam("files") MultipartFile[] files) {
        if (ObjectUtils.isEmpty(docId)) {
            return ResponseEntity.badRequest().body("Document ID is empty");
        }

        if (files == null || files.length == 0) {
            return ResponseEntity.badRequest().body("Please select a file to upload.");
        }

        Optional<MultipartFile> invalidFile = Arrays.stream(files)
                .filter(file -> {
                    String contentType = file.getContentType();
                    return contentType == null ||
                            !(contentType.equals(MediaType.IMAGE_PNG_VALUE) ||
                                    contentType.equals(MediaType.IMAGE_JPEG_VALUE));
                })
                .findFirst();

        if (invalidFile.isPresent()) {
            return ResponseEntity.badRequest().body(
                    "Only PNG and JPEG images are allowed. Invalid file: " + invalidFile.get().getOriginalFilename());
        }

        List<DocumentImage> entities = new ArrayList<>();

        try {
            for (MultipartFile file : files) {
                entities.add(this.imageService.uploadImage(
                        UUID.fromString(docId),
                        file.getOriginalFilename(),
                        file));
            }
        } catch (IOException e) {
            log.error("Exception while uploading file", e);
            return ResponseEntity.internalServerError().body("Error while uploading file");
        }
        List<DocumentImageDto> uploadedFiles = entities.stream()
                .map(entity -> DocumentImageDto.builder()
                        .id(entity.getImageId())
                        .name(entity.getUserSuppliedName())
                        .url("/document/" + docId + "/images/" + entity.getImageId())
                        .mimeType(entity.getMimeType())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(uploadedFiles);
    }

    @GetMapping(value = "{imageId}")
    public ResponseEntity<byte[]> getImageBlob(@PathVariable UUID docId, @PathVariable UUID imageId) {
        if (ObjectUtils.isEmpty(docId)) {
            return ResponseEntity.badRequest().body(null);
        }

        if (ObjectUtils.isEmpty(imageId)) {
            return ResponseEntity.badRequest().body(null);
        }

        Optional<DocumentImage> picture = documentImageService.getPictureFromDocumentAndImageId(
                docId, imageId);

        if (picture.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        byte[] imageBytes = this.imageService.downloadImage(docId, imageId);

        if (imageBytes == null || imageBytes.length == 0) {
            return ResponseEntity.notFound().build();
        }

        MediaType mediaType = MediaType.parseMediaType(picture.get().getMimeType());

        return ResponseEntity.ok()
                .contentType(mediaType)
                .contentLength(imageBytes.length)
                .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic())
                .body(imageBytes);
    }

    @PutMapping(value = "{imageId}")
    public ResponseEntity<?> updateImage(
            @PathVariable UUID docId,
            @PathVariable UUID imageId,
            @RequestBody DocumentImageUpdateRequestDto file) {
        if (ObjectUtils.isEmpty(docId)) {
            return ResponseEntity.badRequest().body(null);
        }

        if (ObjectUtils.isEmpty(imageId)) {
            return ResponseEntity.badRequest().body(null);
        }

        DocumentImage updatedImage = this.documentImageService.updatePicture(docId, imageId, file.getName());

        DocumentImageDto imageDto = DocumentImageDto.builder()
                .id(updatedImage.getImageId())
                .name(updatedImage.getUserSuppliedName())
                .url("/document/" + docId + "/images/" + updatedImage.getImageId())
                .mimeType(updatedImage.getMimeType())
                .build();

        return ResponseEntity.ok(imageDto);
    }

    @GetMapping
    public ResponseEntity<List<DocumentImageDto>> getImages(@PathVariable UUID docId) {
        if (ObjectUtils.isEmpty(docId)) {
            return ResponseEntity.badRequest().body(null);
        }

        List<DocumentImage> pictures = documentImageService.getPicturesForDocument(docId);

        if (pictures.isEmpty()) {
            return ResponseEntity.ok().body(List.of());
        }

        List<DocumentImageDto> imageDtos = pictures.stream()
                .map(picture -> DocumentImageDto.builder()
                        .id(picture.getImageId())
                        .name(picture.getUserSuppliedName())
                        .url("/document/" + docId + "/images/" + picture.getImageId())
                        .mimeType(picture.getMimeType())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(imageDtos);
    }

    @DeleteMapping(value = "{imageId}")
    public ResponseEntity<?> deleteImage(@PathVariable UUID docId, @PathVariable UUID imageId) {
        if (ObjectUtils.isEmpty(docId)) {
            return ResponseEntity.badRequest().body("Document ID is empty");
        }
        if (ObjectUtils.isEmpty(imageId)) {
            return ResponseEntity.badRequest().body("Image ID is empty");
        }

        Boolean deleted = this.imageService.deleteImage(docId, imageId);

        if (!deleted) {
            return ResponseEntity.status(500).body("Failed to delete image");
        }

        return ResponseEntity.ok().build();
    }
}
