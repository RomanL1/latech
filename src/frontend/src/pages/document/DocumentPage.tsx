import { useParams } from "react-router";
import { useGetDocument } from "../../features/documents/api";
import { DocumentView } from "./document-view/DocumentView";
import PasswordProtectionView from "./password-protection/PasswordProtectionView";

const DocumentPage = () => {
    const { documentId } = useParams<{ documentId: string }>();
    const { data: document } = useGetDocument(documentId);
    const documentLocked = document && document.secured && document.content === null;

    if(documentLocked) {
        return <PasswordProtectionView documentId={documentId} />;
    }

    if(!document) {
        return <div>Document not found</div>;
    }
    
    return (
       <DocumentView document={document} />
    );
}

export default DocumentPage;