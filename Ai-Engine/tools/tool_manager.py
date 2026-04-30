class ToolManager:
    def __init__(self):
        self.tools = {}

    def register_tool(self, name, tool):
        """
        Register a tool in the system.

        name: string identifier of tool
        tool: callable (function or class with __call__)
        """
        if name in self.tools:
            raise Exception(f"Tool '{name}' already registered")

        self.tools[name] = tool
        print(f"[ToolManager] Registered tool: {name}")

    def execute(self, tool_name, logger=None, **kwargs):
        """
        Execute a tool by name.

        tool_name: name of registered tool
        logger: optional Logger instance
        kwargs: arguments passed to tool
        """


        if tool_name not in self.tools:
            error_msg = f"Tool '{tool_name}' not found"

            if logger:
                logger.error(error_msg)
            else:
                print(f"[ToolManager ERROR] {error_msg}")

            raise Exception(error_msg)

        if logger:
            logger.info(f"Executing tool: {tool_name}")
        else:
            print(f"[ToolManager] Executing: {tool_name}")

        tool = self.tools[tool_name]

        try:
            result = tool(**kwargs)

            if logger:
                logger.info(f"Tool '{tool_name}' executed successfully")
            else:
                print(f"[ToolManager] {tool_name} success")

            return result

        except Exception as e:
            if logger:
                logger.error(f"Tool '{tool_name}' failed: {str(e)}")
            else:
                print(f"[ToolManager ERROR] {tool_name} failed: {e}")

            raise e