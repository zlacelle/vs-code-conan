import "reflect-metadata";
import { expect } from 'chai';
import { container } from 'tsyringe';
import { Commands } from "../../../src/commands/commands";
import { SystemPlugin } from '../../../src/system/plugin';
import { SystemPluginMock } from '../system-mock';

container.registerInstance(SystemPlugin, new SystemPluginMock());

const configStringProfile = `{"profiles": [{ 
    "name":"a", 
    "conanFile":"\${workspaceFolder}/a/conanfile.py",
    "profile":"\${workspaceFolder}/.profile/a-profile",
    "installArg": "--build=missing",
    "buildArg":"test",
    "createUser": "disroop",
    "createChannel": "development",
    "createArg": "--build=missing" 
}
]}`;
const configStringWorkspace = `{"workspace": [
    { 
        "name":"ws-debug",
        "conanWs": "\${workspaceFolder}/.infrastructure/workspace/ws-linux.yml",
        "profile": "\${workspaceFolder}/.infrastructure/conan_config/profiles/clang-apple-debug",
        "arg": "--build=missing"
    }]}`;

describe('Commands', () => {
    it('can profile install', () => {
        const filepath = "path";

        const system = container.resolve(SystemPluginMock);
        
        system.setFile(configStringProfile);
        // We can mock a class at any level in the dependency tree without touching anything else
        container.registerInstance(SystemPlugin,system);

        let commands = new Commands(filepath);

        commands.install("a");
        expect(system.command).to.eql("conan install --profile:build root-workspace/.profile/a-profile --profile:host root-workspace/.profile/a-profile --build=missing --install-folder build/a root-workspace/a/conanfile.py"); 
    });
    it('can workspace install', () => {
        const filepath = "path";

        const system = container.resolve(SystemPluginMock);
        
        system.setFile(configStringWorkspace);
        // We can mock a class at any level in the dependency tree without touching anything else
        container.registerInstance(SystemPlugin,system);

        let commands = new Commands(filepath);

        commands.install("ws-debug");
        expect(system.command).to.eql("conan workspace install --profile:build root-workspace/.infrastructure/conan_config/profiles/clang-apple-debug --profile:host root-workspace/.infrastructure/conan_config/profiles/clang-apple-debug --build=missing --install-folder build/ws-debug root-workspace/.infrastructure/workspace/ws-linux.yml"); 
    });
});