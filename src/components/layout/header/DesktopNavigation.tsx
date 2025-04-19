
import { NavLink } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Mail, Box, ShoppingBag, User } from 'lucide-react';
import * as SimpleIcons from 'simple-icons';

// Create icon components from simple-icons SVG paths
const SimpleIcon = ({ icon, className = "" }: { icon: { path: string, title: string }, className?: string }) => (
  <svg 
    role="img" 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
  >
    <path d={icon.path} />
  </svg>
);

const DesktopNavigation = () => {
  return (
    <nav className="hidden lg:flex items-center space-x-6">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Accounts</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid gap-2 p-4 w-[320px]">
                <NavigationMenuLink asChild>
                  <NavLink to="/categories/telegram-accounts" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                    <SimpleIcon icon={SimpleIcons.siTelegram} className="w-4 h-4 text-[#26A5E4]" />
                    <span>Telegram Accounts</span>
                  </NavLink>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <NavLink to="/categories/discord-accounts" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                    <SimpleIcon icon={SimpleIcons.siDiscord} className="w-4 h-4 text-[#5865F2]" />
                    <span>Discord Accounts</span>
                  </NavLink>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <NavLink to="/categories/tiktok-accounts" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                    <SimpleIcon icon={SimpleIcons.siTiktok} className="w-4 h-4" />
                    <span>TikTok Accounts</span>
                  </NavLink>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <NavLink to="/categories/instagram-accounts" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                    <SimpleIcon icon={SimpleIcons.siInstagram} className="w-4 h-4 text-[#E4405F]" />
                    <span>Instagram Accounts</span>
                  </NavLink>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <NavLink to="/categories/other-accounts" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                    <User className="w-4 h-4" />
                    <span>Other Accounts</span>
                  </NavLink>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Emails</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid gap-2 p-4 w-[320px]">
                <NavigationMenuLink asChild>
                  <NavLink to="/categories/gmail" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                    <SimpleIcon icon={SimpleIcons.siGmail} className="w-4 h-4 text-[#EA4335]" />
                    <span>Gmail Accounts</span>
                  </NavLink>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <NavLink to="/categories/outlook" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                    <SimpleIcon icon={SimpleIcons.siMicrosoftoutlook} className="w-4 h-4 text-[#0078D4]" />
                    <span>Outlook Accounts</span>
                  </NavLink>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <NavLink to="/categories/yahoo" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                    <SimpleIcon icon={SimpleIcons.siYmail} className="w-4 h-4 text-[#6001D2]" />
                    <span>Yahoo Accounts</span>
                  </NavLink>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <NavLink to="/categories/other-emails" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                    <Mail className="w-4 h-4" />
                    <span>Other Email Accounts</span>
                  </NavLink>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Software & Keys</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid gap-2 p-4 w-[320px]">
                <NavigationMenuLink asChild>
                  <NavLink to="/categories/windows" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                    <SimpleIcon icon={SimpleIcons.siWindows} className="w-4 h-4 text-[#0078D4]" />
                    <span>Windows Keys</span>
                  </NavLink>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <NavLink to="/categories/office" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                    <SimpleIcon icon={SimpleIcons.siMicrosoftoffice365} className="w-4 h-4 text-[#D83B01]" />
                    <span>Office Keys</span>
                  </NavLink>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <NavLink to="/categories/antivirus" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                    <SimpleIcon icon={SimpleIcons.siAvast} className="w-4 h-4 text-[#FF7800]" />
                    <span>Antivirus Keys</span>
                  </NavLink>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <NavLink to="/categories/other-software" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                    <Box className="w-4 h-4" />
                    <span>Other Software</span>
                  </NavLink>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
};

export default DesktopNavigation;
