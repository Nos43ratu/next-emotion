import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/router";
import {
  Box,
  Grid,
  Typography,
  Button,
  Modal,
  Paper,
  TextField,
} from "@mui/material";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useForm, Controller } from "react-hook-form";
import TreeItem from "@mui/lab/TreeItem";
import DeleteIcon from "@mui/icons-material/Delete";

const Project = () => {
  return (
    <ProjectContextProvider>
      <Grid container sx={{ height: "100%" }}>
        <LeftSide />
        <RightSide />
      </Grid>
    </ProjectContextProvider>
  );
};

const LeftSide = () => {
  const [addPageOpen, setAddPageOpen] = useState(false);

  return (
    <Grid
      item
      xs={2}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <Typography component="p" variant="h5">
          Pages
        </Typography>
        <ProjectTree />
      </div>
      <Button variant="contained" onClick={() => setAddPageOpen(true)}>
        Add page
      </Button>
      <AddProjectModal open={addPageOpen} setOpen={setAddPageOpen} />
    </Grid>
  );
};

const createPage = async ({
  name,
  projectId,
}: {
  name: string;
  projectId: string;
}) => {
  return await fetch(`/api/tms/page/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, projectId }),
  }).then((res) => res.json());
};

const AddProjectModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  const { projectId, refresh } = useProject();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: any) => {
    await createPage({ name: data.name, projectId }).then((res) => {
      setOpen(false);
      refresh();
    });
  };

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Controller
            control={control}
            name="name"
            render={({ field }: { field: any }) => (
              <TextField {...field} required label="Page name" />
            )}
          />
          <Button type="submit">Create page</Button>
        </Paper>
      </form>
    </Modal>
  );
};

const getSection = async (id: string) => {
  return await fetch("/api/tms/section/" + id, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());
};

const updateSection = async (id: string, data: any) => {
  return await fetch("/api/tms/section/" + id, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  }).then((res) => res.json());
};

const RightSide = () => {
  const { selectedSectionId } = useProject();
  const [sectionData, setSectionData] = useState<SectionType | null>(null);

  useEffect(() => {
    if (selectedSectionId) {
      getSection(selectedSectionId).then((section) => setSectionData(section));
    }
  }, [selectedSectionId]);

  const mockData = {
    buttons: {
      submit: "Submit",
      delete: "delete",
    },
    alerts: {
      register: "register",
      login: "login",
    },
  };

  return (
    <Grid item xs={8}>
      <Box>
        <Typography component="p" variant="h5">
          {sectionData?.name}
          {Object.entries(mockData).map(([key, value]) => (
            <section key={key}>
              <span className="text-lg">{key}</span>
              <div className="flex flex-col space-y-4">
                {Object.entries(value).map(([key, value]) => (
                  <div
                    key={value}
                    className="flex text-base items-center space-x-5 flex-flo"
                  >
                    <span className="w-[100px]">{key}</span>
                    <TextField type="text" value={value} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </Typography>
      </Box>
    </Grid>
  );
};

const ProjectTree = () => {
  const { projectData, refresh, setSelectedSectionId } = useProject();

  const pages = projectData?.pages ?? [];

  const handleDeletePage = async (id: string) => {
    await fetch(`/api/tms/page/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).then(() => refresh());
  };

  const handleDeleteSection = async (id: string) => {
    await fetch(`/api/tms/section/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).then(() => refresh());
  };

  return pages.length === 0 ? null : (
    <TreeView
      aria-label="file system navigator"
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      sx={{ height: 240, flexGrow: 1, width: "100%", overflowY: "auto" }}
    >
      {pages.map((page) => (
        <TreeItem
          key={page.id}
          nodeId={page.id}
          label={
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 0.5,
                pr: 0,
              }}
            >
              <span>{page.name}</span>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePage(page.id);
                }}
              >
                <DeleteIcon />
              </Button>
            </Box>
          }
        >
          {page.section.length !== 0 &&
            page.section.map((section) => (
              <TreeItem
                key={section.id}
                nodeId={section.id}
                onClick={() => {
                  setSelectedSectionId(section.id);
                }}
                label={
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 0.5,
                      pr: 0,
                    }}
                  >
                    <span>{section.name}</span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSectionId(null);
                        handleDeleteSection(section.id);
                      }}
                    >
                      <DeleteIcon />
                    </Button>
                  </Box>
                }
              />
            ))}
          <CreateSectionModal pageId={page.id} />
        </TreeItem>
      ))}
    </TreeView>
  );
};

const createSection = async ({
  name,
  pageId,
}: {
  name: string;
  pageId: string;
}) => {
  return await fetch(`/api/tms/section/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, pageId, data: "" }),
  }).then((res) => res.json());
};

const CreateSectionModal = ({ pageId }: { pageId: string }) => {
  const [open, setOpen] = useState(false);
  const { refresh } = useProject();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: any) => {
    await createSection({ name: data.name, pageId }).then((res) => {
      setOpen(false);
      refresh();
    });
  };

  return (
    <>
      <TreeItem
        key={`${pageId}-create`}
        nodeId={`${pageId}-create`}
        label="crate section"
        onClick={() => setOpen(true)}
      />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Paper
            sx={{
              position: "absolute" as "absolute",
              top: "50%",
              left: "50%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Controller
              control={control}
              name="name"
              render={({ field }: { field: any }) => (
                <TextField {...field} required label="Section name" />
              )}
            />
            <Button type="submit">Create section</Button>
          </Paper>
        </form>
      </Modal>
    </>
  );
};

interface SectionType {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  data: string;
  pageId: string;
}

interface PageType {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  section: SectionType[];
}

interface ProjectType {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  locales: string;
  pages: PageType[];
}

interface ProjectContextType {
  projectId: string;
  projectData: ProjectType | null;
  refresh: () => void;
  selectedSectionId: string | null;
  setSelectedSectionId: (id: string | null) => void;
}

const ProjectContext = createContext({} as ProjectContextType);

const getProject = async (id: string) => {
  return await fetch(`/api/tms/project/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());
};

const ProjectContextProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const [projectData, setProjectData] = useState<ProjectType | null>(null);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );

  const projectId = useMemo(() => {
    if (router.isReady) {
      return String(router.query.id ?? "");
    }
    return "";
  }, [router]);

  const refresh = useCallback(async () => {
    getProject(projectId).then((project) => setProjectData(project));
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      getProject(projectId).then((project) => setProjectData(project));
    }
  }, [projectId]);

  const { Provider } = ProjectContext;
  return (
    <Provider
      value={{
        projectId,
        projectData,
        refresh,
        selectedSectionId,
        setSelectedSectionId,
      }}
    >
      {children}
    </Provider>
  );
};

const useProject = () => useContext(ProjectContext);

export default Project;
