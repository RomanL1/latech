package com.latech.renderer.application;

import com.latech.renderer.model.PdfJob;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;
import java.nio.file.Path;

@SpringBootTest
class RenderingPoCTest {

    @Autowired
    private RenderingPoC renderer;

    @Test
    @Disabled
    void compileTest1() {

        String testString = "\\documentclass{article}\n" +
                "\\usepackage{amsmath}\n" +
                "\\begin{document}\n" +
                "\n" +
                "Hello, \\textbf{world}! Here is Euler's identity: $e^{i\\pi} + 1 = 0$.\n" +
                "\n" +
                "A display-mode equation:\n" +
                "\\[\n" +
                "  \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}\n" +
                "\\]\n" +
                "\n" +
                "\\textit{Inline fraction:} $\\frac{a^2 + b^2}{c^2}$ and a sum $\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$.\n" +
                "\n" +
                "\\end{document}";

        PdfJob pdfJob = new PdfJob("test1", testString);
        Path pdfPath = null;
        try {
            pdfPath = renderer.compile(pdfJob);
        } catch (IOException | InterruptedException e) {
            System.out.println("exception while compiling pdf: " + e);
        }
        System.out.println(pdfPath);
    }

    @Test
    @Disabled
    void comparingShortAndLongerLatexTest() {
        String shortTest = "\\documentclass{article}\n" +
                "\\begin{document}\n" +
                "Hello.\n" +
                "\\end{document}";

        String longTest = "\\documentclass{article}\n" +
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

        PdfJob pdfJob = new PdfJob("shortTest", shortTest);
        try {
            renderer.compile(pdfJob);
        } catch (IOException | InterruptedException e) {
            System.out.println("exception while compiling pdf: " + e);
        }

        pdfJob = new PdfJob("longTest", longTest);
        Path pdfPath = null;
        try {
            pdfPath = renderer.compile(pdfJob);
        } catch (IOException | InterruptedException e) {
            System.out.println("exception while compiling pdf: " + e);
        }
        System.out.println(pdfPath);

    }
}