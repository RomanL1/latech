package com.latech.renderer.api;

import com.latech.renderer.business.PdfJobWorker;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;


@SpringBootTest
class PdfJobWorkerIntegrationTest {

    @Autowired
    private PdfJobWorker pdfJobWorker;

    @Test
    @Disabled
    void shouldProducePdf() throws Exception {
        String documentId = UUID.randomUUID().toString();
        String latexContent = "\\documentclass{article}\n" +
                "\\usepackage{amsmath}\n" +
                "\\usepackage{amssymb}\n" +
                "\\begin{document}\n" +
                "\n" +
                "\\title{A Mathematical Overview}\n" +
                "\\author{Test Author}\n" +
                "\\maketitle\n" +
                "\n" +
                "\\section{Calculus}\n" +
                "The fundamental theorem of calculus states that if $f$ is continuous on $[a,b]$, then:\n" +
                "\\[\n" +
                "    \\int_a^b f(x)\\,dx = F(b) - F(a)\n" +
                "\\]\n" +
                "where $F'(x) = f(x)$. A related result is the Gaussian integral:\n" +
                "\\[\n" +
                "    \\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}\n" +
                "\\]\n" +
                "\n" +
                "\\section{Series}\n" +
                "The Basel problem gives us $\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$.\n" +
                "More generally, the Riemann zeta function is defined as:\n" +
                "\\[\n" +
                "    \\zeta(s) = \\sum_{n=1}^{\\infty} \\frac{1}{n^s}, \\quad \\text{for } \\Re(s) > 1\n" +
                "\\]\n" +
                "\n" +
                "\\section{Linear Algebra}\n" +
                "For an $n \\times n$ matrix $A$, the characteristic polynomial is $\\det(A - \\lambda I) = 0$.\n" +
                "The trace satisfies $\\text{tr}(A) = \\sum_{i=1}^{n} \\lambda_i$ and the determinant $\\det(A) = \\prod_{i=1}^{n} \\lambda_i$.\n" +
                "\n" +
                "\\section{Probability}\n" +
                "A normal distribution has density:\n" +
                "\\[\n" +
                "    f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}\n" +
                "\\]\n" +
                "The expected value of a discrete random variable is $\\mathbb{E}[X] = \\sum_{x} x \\cdot P(X = x)$.\n" +
                "\n" +
                "\\end{document}";
        DocumentRecord payload = DocumentRecord.newBuilder()
                .setDocumentId(documentId)
                .setRenderId(documentId)
                .setLatexContent(latexContent)
                .addImageIds( UUID.randomUUID().toString() )
                .addImageIds( UUID.randomUUID().toString() )
                .addImageIds( UUID.randomUUID().toString() )
                .build();

        Path pdfPath =  pdfJobWorker.createPdf(payload);
        assertTrue(Files.exists(pdfPath));
    }
}